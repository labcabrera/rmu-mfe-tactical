import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button } from '@mui/material';
import { RmuDialog, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { TFunction } from 'i18next';
import { resolveBreakageCheck } from '../../api/actor-rounds';
import { ActorRound, ActorRoundAlert, BreakageCheckResult } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import BreakageForm, { BreakageFormValue, emptyBreakageForm, toBreakageDto } from './BreakageForm';

/** The message of a check result: the row of Table 6-1, and whether the damage is temporary or a repair. */
const breakageResultMessage = (t: TFunction, result: BreakageCheckResult): string => {
  const parts = [`${t('breakage-total')} ${result.total}: ${t(`breakage-result-${result.result}`)}`];
  if (result.modifier?.temporary) parts.push(t('breakage-temporary'));
  if (result.modifier && result.modifier.value > 0)
    parts.push(t('breakage-repaired', { value: result.modifier.value }));
  return parts.join('. ');
};

/**
 * Breakage check of an item of the actor (spec 019): from a breakage alert, which it resolves, or by hand from the
 * items of the actor (maneuvers with 33 or 77, or what the game master asks for).
 */
const BreakageCheckDialog: FC<{
  actorRound: ActorRound;
  alert?: ActorRoundAlert;
  itemId?: string;
  open: boolean;
  onClose: () => void;
}> = ({ actorRound, alert, itemId, open, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const { busy, run } = useBusyAction();
  const [value, setValue] = useState<BreakageFormValue>(() => emptyBreakageForm(actorRound, alert, itemId));

  useEffect(() => {
    if (open) setValue(emptyBreakageForm(actorRound, alert, itemId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, alert?.id, itemId]);

  const dto = toBreakageDto(actorRound, alert, value);

  const resolve = () => {
    if (!dto) return;
    run(
      resolveBreakageCheck(actorRound.id, dto, auth).then((updated) => {
        updateActorRound(updated);
        if (updated.lastBreakageCheck) notify.success(breakageResultMessage(t, updated.lastBreakageCheck));
        onClose();
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="md"
      title={t('breakage-check')}
      subtitle={actorRound.actorName}
      buttons={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button key="resolve" onClick={resolve} variant="contained" color="primary" disabled={busy || !dto}>
          {t('breakage-resolve')}
        </Button>,
      ]}
    >
      <BreakageForm actorRound={actorRound} alert={alert} value={value} onChange={setValue} />
    </RmuDialog>
  );
};

export default BreakageCheckDialog;
