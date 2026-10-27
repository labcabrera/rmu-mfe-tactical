import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import Button from '@mui/material/Button';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { resolveAlert, resolveEnduranceCheck } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';
import ActorAlertForm from './ActorAlertForm';
import BreakageCheckDialog from './BreakageCheckDialog';
import FrenzyDyingRrDialog from './FrenzyDyingRrDialog';
import EnduranceForm, { emptyEnduranceForm, EnduranceFormValue, enduranceModifiers } from './EnduranceForm';

/**
 * Dialog of an actor's alert. An endurance alert is resolved with its roll (`PATCH /actor-rounds/{id}/endurance-check`,
 * which applies the fatigue and hits and clears the alert) and a breakage alert with its check (spec 019); the others
 * are edited and saved locally.
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

  // Spec 034: the critical of a fumble is rolled by hand; applying the alert resolves it.
  const resolveCritical = () => {
    setBusy(true);
    resolveAlert(actorRound.id, alertId, auth)
      .then((updated) => {
        updateActorRound(updated);
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const handleSave = () => {
    if (isEndurance) {
      resolveEndurance();
      return;
    }
    if (currentAlert?.type === 'critical') {
      resolveCritical();
      return;
    }
    if (currentAlert) onSave?.(currentAlert);
    onClose();
  };

  if (currentAlert?.type === 'breakage') {
    return <BreakageCheckDialog actorRound={actorRound} alert={currentAlert} open={open} onClose={onClose} />;
  }
  if (currentAlert?.type === 'frenzy-dying') {
    return <FrenzyDyingRrDialog actorRound={actorRound} open={open} onClose={onClose} />;
  }

  return (
    <RmuDialog
      open={open}
      onClose={onClose}
      maxWidth={isEndurance ? 'md' : 'xl'}
      title={isEndurance ? t('endurance-check') : t('alert')}
      subtitle={isEndurance ? actorRound.actorName : undefined}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button
          key="apply"
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={busy || (isEndurance && endurance.roll === null)}
        >
          {isEndurance ? t('resolve') : t('apply')}
        </Button>,
      ]}
    >
      {!currentAlert ? (
        <div>{t('alert-not-found')}</div>
      ) : isEndurance ? (
        <EnduranceForm actorRound={actorRound} value={endurance} onChange={setEndurance} />
      ) : (
        <ActorAlertForm actorRound={actorRound} alertId={alertId} onChange={handleChange} />
      )}
    </RmuDialog>
  );
};

export default ActorAlertDialog;
