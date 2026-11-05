import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { formatBonus, ReactionForcedRequest, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { CombatContext } from '../../../CombatContext';
import { createAction } from '../../api/action';
import { resolveAlert } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { reactionWeapons } from '../../services/combat-talents-service';
import { useTacticalNotify } from '../../services/notify-service';
import { phaseNumber } from '../actor-rounds/round-grid';
import { useOptionalCombatPanel } from '../panel/CombatPanelProvider';

/** Alerts of the combat talents (workspace spec 076) the API lets the game master dismiss. */
export const COMBAT_TALENT_ALERTS = ['reaction-available', 'terrible-luck'];

/** "Attack (Riposte, OB +15)": the attack a reaction alert offers. */
export const reactionAttackLabel = (alert: ActorRoundAlert, t: TFunction): string => {
  const reaction = alert.reaction;
  if (!reaction) return t('alert-reaction-available');
  return reaction.obOverride === null || reaction.obOverride === undefined
    ? t('reaction-attack', { trait: t(reaction.traitId) })
    : t('reaction-attack-ob', { trait: t(reaction.traitId), ob: formatBonus(reaction.obOverride) });
};

/**
 * Alerts of the combat talents (workspace spec 076, §2.1). A `reaction-available` one (Riposte, Opportunistic Strike)
 * offers the attack it allows: a melee attack forced as `reaction` from the alert, 0 AP, with the fixed OB of a Riposte,
 * whose flow opens at once; the game master may dismiss it, and it expires when the phase ends. A `terrible-luck` one
 * (a natural 01) is only read: the game master narrates the failure and dismisses it.
 */
const CombatTalentAlertDialog: FC<{
  actorRound: ActorRound;
  alert: ActorRoundAlert;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const panel = useOptionalCombatPanel();
  const { game, actorRounds, roundActions, setRoundActions, updateActorRound, refreshActorRounds } =
    useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const reaction = alert.type === 'reaction-available' ? alert.reaction : undefined;
  const target = reaction ? actorRounds?.find((each) => each.actorId === reaction.targetActorId) : undefined;
  const weapons = reaction ? reactionWeapons(actorRound, reaction.traitId) : [];
  const modifier = (key: string) => alert.modifiers?.find((each) => each.key === key)?.modifier ?? undefined;
  // It is taken in the phase it was raised in: the API rejects it once the game moved on
  const current = !reaction || (game?.round === reaction.round && game?.phase === reaction.phase);

  const dismiss = () => {
    setBusy(true);
    resolveAlert(actorRound.id, alert.id, auth)
      .then((updated) => {
        updateActorRound(updated);
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const attack = () => {
    if (!game || !reaction) return;
    setBusy(true);
    const forced: ReactionForcedRequest = { reason: 'reaction', alertId: alert.id };
    createAction(
      {
        gameId: game.id,
        actorId: actorRound.actorId,
        actionType: 'melee_attack',
        phaseStart: phaseNumber(game.phase),
        freeAction: false,
        forced,
      },
      auth
    )
      .then((action) => {
        setRoundActions([...(roundActions ?? []), action]);
        // The API resolved the alert: read the actor again
        refreshActorRounds();
        notify.success(t('action-declared', { action: reactionAttackLabel(alert, t) }));
        onClose();
        panel?.resolveAction(action);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="sm"
      title={t(`alert-${alert.type}`)}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="dismiss" onClick={dismiss} disabled={busy} color={reaction ? 'inherit' : 'primary'}>
          {t('dismiss')}
        </Button>,
        ...(reaction
          ? [
              <Button
                key="attack"
                variant="contained"
                startIcon={<SportsMartialArtsIcon />}
                onClick={attack}
                disabled={busy || !current || weapons.length === 0}
              >
                {reactionAttackLabel(alert, t)}
              </Button>,
            ]
          : []),
      ]}
    >
      {reaction ? (
        <Stack spacing={1.5}>
          <Typography variant="body2">
            {t(`alert-reaction-available-text-${reaction.traitId}`, {
              target: target?.actorName ?? reaction.targetActorId,
            })}
          </Typography>
          {reaction.obOverride !== null && reaction.obOverride !== undefined && (
            <Typography variant="body2" color="text.secondary">
              {t('reaction-ob-override', { ob: formatBonus(reaction.obOverride) })}
            </Typography>
          )}
          <Alert severity="info" variant="outlined">
            {t('alert-reaction-available-help')}
          </Alert>
          {!current && (
            <Alert severity="warning" variant="outlined">
              {t('alert-reaction-expired')}
            </Alert>
          )}
          {current && weapons.length === 0 && (
            <Alert severity="warning" variant="outlined">
              {t('reaction-no-weapon')}
            </Alert>
          )}
        </Stack>
      ) : (
        <Stack spacing={1.5}>
          <Typography variant="body2">
            {t('alert-terrible-luck-text', { origin: t(`roll-origin-${modifier('origin') ?? 'maneuver'}`) })}
          </Typography>
          <Alert severity="warning" variant="outlined">
            {t('alert-terrible-luck-help')}
          </Alert>
        </Stack>
      )}
    </RmuDialog>
  );
};

export default CombatTalentAlertDialog;
