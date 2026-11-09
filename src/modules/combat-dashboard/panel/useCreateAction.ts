import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { FALL_CONTROL_PURPOSE, GRAPPLE_ESCAPE_PURPOSE, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { createAction } from '../../api/action';
import { Action } from '../../api/action.dto';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useActionConfirm, useNotifyWarnings } from '../../hooks/useActionWarnings';
import { useBusyAction } from '../../hooks/useBusyAction';
import { rememberPurpose } from '../../services/combat-talents-service';
import { PaletteEntry } from './palette-rules';

/** Creates an action of an actor in a phase, retroactive when it is a past one, and adds it to the round. */
export const useCreateAction = (
  actorRound: ActorRound | null,
  phase: number,
  retroactive: boolean,
  onCreated: (action: Action) => void
) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const notifyWarnings = useNotifyWarnings();
  const confirm = useActionConfirm();
  const { game } = useCombatGame();
  const { roundActions } = useCombatRound();
  const { setRoundActions, refreshActorRounds } = useCombatActions();
  const { busy, run } = useBusyAction();

  const create = (entry: PaletteEntry, extra: Record<string, unknown> = {}) => {
    if (!game || !actorRound || busy) return;
    const body = {
      gameId: game.id,
      actorId: actorRound.actorId,
      actionType: entry.type,
      phaseStart: phase,
      freeAction: !!entry.freeAction,
      ...(retroactive ? { retroactive: true } : {}),
      ...(entry.forced ? { forced: { reason: entry.forced } } : {}),
      ...extra,
    };
    // Workspace spec 068: interrupting a treatment or exerting with a wound that reopens asks for a confirmation
    run(
      confirm
        .run((confirmed) => createAction(confirmed ? { ...body, confirm: true } : body, auth))
        .then((action) => {
          // The interrupted actions closed: read the round again (a reopened wound changed an actor round too)
          const interrupts = (roundActions ?? []).some(
            (a) => a.actorId === action.actorId && a.id !== action.id && !a.freeAction
          );
          setRoundActions((previous) => [...(previous ?? []), action]);
          // A combat talent maneuver: its flow starts with the purpose chosen (workspace spec 076); "Break free" opens
          // its own flow (workspace spec 077)
          if (entry.purpose) rememberPurpose(action.id, entry.purpose);
          if (entry.grappleEscape) rememberPurpose(action.id, GRAPPLE_ESCAPE_PURPOSE);
          if (entry.fallControl) rememberPurpose(action.id, FALL_CONTROL_PURPOSE);
          if (interrupts || (action.warnings ?? []).length > 0) refreshActorRounds();
          notify.success(t('action-declared', { action: entry.label }));
          notifyWarnings(action.warnings);
          onCreated(action);
        })
    );
  };
  return { create, busy, confirmDialog: confirm.dialog };
};
