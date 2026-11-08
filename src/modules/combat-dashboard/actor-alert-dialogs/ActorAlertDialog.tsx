import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Stack } from '@mui/material';
import Button from '@mui/material/Button';
import { FALL_SUGGESTED_ALERT, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import HazardDialog from '../../actor-round/hazards/HazardDialog';
import ResistanceRollDialog from '../../actor-round/psychology/ResistanceRollDialog';
import { loosenActorRoundTourniquet, resolveAlert, resolveEnduranceCheck } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import GroupCheckDialog from '../psychology/GroupCheckDialog';
import ActorAlertForm from './ActorAlertForm';
import BreakageCheckDialog from './BreakageCheckDialog';
import BreathCheckAlertDialog, { BREATH_CHECK_ALERT } from './BreathCheckAlertDialog';
import CombatTalentAlertDialog, { COMBAT_TALENT_ALERTS } from './CombatTalentAlertDialog';
import CriticalAlertDialog from './CriticalAlertDialog';
import DeathThresholdAlertDialog, { DEATH_THRESHOLD_ALERT } from './DeathThresholdAlertDialog';
import EnduranceForm, { emptyEnduranceForm, EnduranceFormValue, enduranceModifiers } from './EnduranceForm';
import FrenzyDyingRrDialog from './FrenzyDyingRrDialog';
import KnockedBackAlertDialog, { KNOCKED_BACK_ALERT } from './KnockedBackAlertDialog';
import LimbLossAlertDialog, { LIMB_LOSS_ALERT } from './LimbLossAlertDialog';
import MentalFocusAlertDialog, { MENTAL_FOCUS_ALERT } from './MentalFocusAlertDialog';
import StrayShotAlertDialog, { STRAY_SHOT_ALERT } from './StrayShotAlertDialog';

/**
 * Alerts of workspace spec 068 the game master reads and dismisses: the API keeps them until the round ends. A
 * limb-loss alert is confirmed or dismissed in its own dialog (workspace spec 079, C1).
 */
export const INFO_ALERTS = ['wound-reopened'];

/**
 * Dialog of an actor's alert. An endurance alert is resolved with its roll (`PATCH /actor-rounds/{id}/endurance-check`,
 * which applies the fatigue and hits and clears the alert) and a breakage alert with its check (spec 019). Workspace
 * spec 068: a suggested fear check opens the group checks with the faction and fright level, a Revulsion alert the
 * fear RR with its level, a tourniquet alert offers to loosen it, and a reopened wound or a lost limb are only read.
 * Workspace spec 077: a Mental Focus alert takes the outcome of the maneuver, a critical alert its roll (the API applies
 * it) and a suggested fall opens the fall of the actor. Workspace spec 079: a death-threshold alert is confirmed or
 * dismissed, a knocked-back alert offers its hazard, an endurance alert of the total penalties says why, and a
 * stray-shot alert offers the second attack against a combatant in the way.
 * The others are edited and saved locally.
 */
const ActorAlertDialog: FC<{
  actorRound: ActorRound;
  alertId: string;
  open: boolean;
  onClose: () => void;
  onSave?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId, open, onClose, onSave }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const { game, updateActorRound } = useContext(CombatContext)!;
  const [busy, setBusy] = useState(false);
  const [endurance, setEndurance] = useState<EnduranceFormValue>(emptyEnduranceForm);

  const [currentAlert, setCurrentAlert] = useState<ActorRoundAlert | undefined>(
    actorRound.alerts?.find((a) => a.id === alertId)
  );

  useEffect(() => {
    setCurrentAlert(actorRound.alerts?.find((a) => a.id === alertId));
  }, [actorRound, alertId]);

  useEffect(() => {
    if (open) setEndurance(emptyEnduranceForm());
  }, [open, alertId]);

  const isEndurance = currentAlert?.type === 'endurance';
  const modifierOf = (key: string) => currentAlert?.modifiers?.find((m) => m.key === key);
  // Workspace spec 079, decision A3: an endurance roll asked by the total penalties, not by the accumulated fatigue
  const penaltyReason = isEndurance ? modifierOf('reason')?.modifier : undefined;
  // Workspace spec 087: an informative alert closes in the API, so it stays dismissed and reaches the round log
  const dismiss = () => {
    setBusy(true);
    resolveAlert(actorRound.id, alertId, auth)
      .then((updated) => {
        updateActorRound(updated);
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const loosen = () => {
    const injuryId = modifierOf('injuryId')?.modifier;
    if (!injuryId) return;
    setBusy(true);
    loosenActorRoundTourniquet(actorRound.id, injuryId, auth)
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('tourniquet-loosened'));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const handleChange = (updated: ActorRoundAlert) => {
    setCurrentAlert(updated);
  };

  const resolveEndurance = () => {
    if (endurance.roll === null) return;
    setBusy(true);
    resolveEnduranceCheck(
      actorRound.id,
      { roll: endurance.roll, alertId, modifiers: enduranceModifiers(actorRound, game, endurance) },
      auth
    )
      .then((updated) => {
        updateActorRound(updated);
        notify.success(t('endurance-check-resolved', { fatigue: -(updated.fatigue?.fatigue ?? 0) }));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  // A suggested fall that happened or not (workspace spec 077, decision D5): the alert is closed by hand
  const closeSuggestedFall = () => {
    resolveAlert(actorRound.id, alertId, auth)
      .then(updateActorRound)
      .catch((err) => notify.error(err));
  };

  const handleSave = () => {
    if (isEndurance) {
      resolveEndurance();
      return;
    }
    if (currentAlert && INFO_ALERTS.includes(currentAlert.type)) {
      dismiss();
      return;
    }
    if (currentAlert) onSave?.(currentAlert);
    onClose();
  };

  if (currentAlert?.type === 'critical') {
    return <CriticalAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === FALL_SUGGESTED_ALERT) {
    return (
      <HazardDialog
        actorRound={actorRound}
        kind="fall"
        open={open}
        onClose={onClose}
        onResolved={closeSuggestedFall}
        onDismiss={() => {
          closeSuggestedFall();
          onClose();
        }}
        intro={
          <Alert severity="warning" variant="outlined">
            {t('alert-fall-suggested-text', {
              skill: t(modifierOf('skillId')?.modifier ?? ''),
              origin: t(`fall-suggested-origin-${modifierOf('origin')?.modifier ?? 'maneuver'}`),
            })}
          </Alert>
        }
      />
    );
  }
  if (currentAlert?.type === 'breakage') {
    return <BreakageCheckDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert && COMBAT_TALENT_ALERTS.includes(currentAlert.type)) {
    return <CombatTalentAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === MENTAL_FOCUS_ALERT) {
    return <MentalFocusAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  // Workspace spec 079, C4: the outcome of the Endurance maneuver of a held breath
  if (currentAlert?.type === BREATH_CHECK_ALERT) {
    return <BreathCheckAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === LIMB_LOSS_ALERT) {
    return <LimbLossAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === DEATH_THRESHOLD_ALERT) {
    return <DeathThresholdAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === KNOCKED_BACK_ALERT) {
    return <KnockedBackAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === STRAY_SHOT_ALERT) {
    return <StrayShotAlertDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === 'frenzy-dying') {
    return <FrenzyDyingRrDialog actorRound={actorRound} alertId={alertId} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === 'fear-check-suggested') {
    const factionId = modifierOf('factionId')?.modifier;
    return (
      <GroupCheckDialog
        open={open}
        onClose={onClose}
        prefill={{
          kind: 'fear',
          factionIds: factionId ? [factionId] : [],
          frightLevel: modifierOf('frightLevel')?.value,
          alertId,
        }}
      />
    );
  }
  if (currentAlert?.type === 'revulsion-rr') {
    return (
      <ResistanceRollDialog
        actorRound={actorRound}
        open={open}
        onClose={onClose}
        initialLevel={modifierOf('level')?.value ?? null}
        sourceName={t('revulsion')}
        alertId={alertId}
      />
    );
  }
  const tourniquet = currentAlert?.type === 'tourniquet-loosen';
  const info = !!currentAlert && INFO_ALERTS.includes(currentAlert.type);

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth={isEndurance ? 'md' : 'xl'}
      title={isEndurance ? t('endurance-check') : currentAlert ? t(`alert-${currentAlert.type}`) : t('alert')}
      subtitle={isEndurance ? actorRound.actorName : undefined}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        tourniquet ? (
          <Button key="loosen" onClick={loosen} variant="contained" color="warning" disabled={busy}>
            {t('loosen-tourniquet')}
          </Button>
        ) : (
          <Button
            key="apply"
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={busy || (isEndurance && endurance.roll === null)}
          >
            {isEndurance ? t('resolve') : info ? t('dismiss') : t('apply')}
          </Button>
        ),
      ]}
    >
      {!currentAlert ? (
        <div>{t('alert-not-found')}</div>
      ) : isEndurance ? (
        <Stack spacing={2}>
          {penaltyReason && (
            <Alert severity={penaltyReason === 'penalty-dying' ? 'error' : 'warning'} variant="outlined">
              {t(`alert-endurance-${penaltyReason}`, { total: modifierOf('total')?.value ?? 0 })}
            </Alert>
          )}
          <EnduranceForm actorRound={actorRound} value={endurance} onChange={setEndurance} />
        </Stack>
      ) : (
        <ActorAlertForm actorRound={actorRound} alertId={alertId} onChange={handleChange} />
      )}
    </RmuDialog>
  );
};

export default ActorAlertDialog;
