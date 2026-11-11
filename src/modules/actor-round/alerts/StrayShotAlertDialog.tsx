import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Button, Stack, Typography } from '@mui/material';
import {
  RmuDialog,
  RuleHint,
  STRAY_SHOT_ALERT_TYPE,
  strayShotAlertData,
  StrayShotForcedRequest,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { createAction } from '../../api/action';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { useOptionalCombatPanel } from '../../combat/combat-panel-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { attackLabel } from '../../services/attack-label';
import { phaseNumber } from '../../services/phase-service';

/** Alert of workspace spec 079 (A6): a ranged attack into a melee missed its target. */
export const STRAY_SHOT_ALERT = STRAY_SHOT_ALERT_TYPE;

/**
 * Stray shot (workspace spec 079, A6; §9.7): a ranged attack at a target engaged in melee missed, and the API chose
 * at random one of the combatants in the way. The game master confirms it, which declares a second ranged attack
 * forced as `stray-shot` (0 AP, OB 0, no cover, fumbles ignored) with the same weapon against that combatant and
 * opens its flow, or dismisses it.
 */
const StrayShotAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const panel = useOptionalCombatPanel();
  const { game } = useCombatGame();
  const { actorRounds } = useCombatRound();
  const { setRoundActions, updateActorRound, refreshActorRounds } = useCombatActions();
  const { busy, run } = useBusyAction();
  const data = strayShotAlertData(alert.modifiers);
  const nameOf = (actorId: string | null) =>
    actorRounds?.find((each) => each.actorId === actorId)?.actorName ?? actorId ?? '';
  const round = alert.modifiers?.find((each) => each.key === 'round')?.value;
  // It is taken in the round it was raised in: the API rejects it afterwards
  const current = !game || round === undefined || round === null || game.round === round;
  const weapon = data.attackName ? attackLabel(data.attackName, t) : '';

  const dismiss = () => {
    run(
      resolveAlert(actorRound.id, alert.id, auth).then((updated) => {
        updateActorRound(updated);
        notify.success(t('stray-shot-dismissed'));
        onClose();
      })
    );
  };

  const confirm = () => {
    if (!game) return;
    const forced: StrayShotForcedRequest = { reason: 'stray-shot', alertId: alert.id };
    run(
      createAction(
        {
          gameId: game.id,
          actorId: actorRound.actorId,
          actionType: 'ranged_attack',
          phaseStart: phaseNumber(game.phase),
          freeAction: false,
          forced,
        },
        auth
      ).then((action) => {
        setRoundActions((previous) => [...(previous ?? []), action]);
        // The API resolved the alert: read the actor again
        refreshActorRounds();
        notify.success(t('action-declared', { action: t('stray-shot-attack') }));
        onClose();
        panel?.resolveAction(action);
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t('alert-stray-shot')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="dismiss" color="inherit" disabled={busy} onClick={dismiss}>
          {t('dismiss')}
        </Button>,
        <Button key="confirm" variant="contained" disabled={busy || !current || !data.targetActorId} onClick={confirm}>
          {t('stray-shot-confirm')}
        </Button>,
      ]}
    >
      <Stack spacing={2}>
        <Alert severity="warning">{t('alert-stray-shot-text', { weapon, target: nameOf(data.targetActorId) })}</Alert>
        {data.candidates.length > 1 && (
          <Typography variant="body2" color="text.secondary">
            {t('stray-shot-candidates', { names: data.candidates.map(nameOf).join(', ') })}
          </Typography>
        )}
        <RuleHint title={t('alert-stray-shot')} description={t('combat-rule-melee-cover')} reference="§9.7">
          <Typography variant="body2" color="text.secondary">
            {t('alert-stray-shot-help')}
          </Typography>
        </RuleHint>
        {!current && (
          <Alert severity="warning" variant="outlined">
            {t('stray-shot-expired')}
          </Alert>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default StrayShotAlertDialog;
