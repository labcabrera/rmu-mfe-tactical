import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { RmuDialog, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { forceAction } from '../../api/action';
import { Action, ForceReason, OPEN_ACTION_FORCE_REASONS } from '../../api/action.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';

/** Reasons that spend the actor's next AP: the rule needs at least 1 AP already spent on the action (§8.2). */
const NEEDS_AP: ForceReason[] = ['withdrawal', 'pass-through'];

/**
 * Forced resolution of an action (spec 011, §6): the game master picks why it is resolved out of turn, which says
 * where its AP come from (withdrawal and pass-through: the actor's next free AP; an effect: none; game master: the
 * ones already spent), and an optional note. The action then skips the minimum AP and phase checks.
 */
const ForceResolutionDialog: FC<{ action: Action; open: boolean; onClose: () => void }> = ({
  action,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateAction, refreshActorRounds } = useCombatActions();
  const spent = action.actionPoints ?? 0;
  const [reason, setReason] = useState<ForceReason>(spent > 0 ? 'withdrawal' : 'gm');
  const [note, setNote] = useState('');
  const { busy, run } = useBusyAction();
  const allowed = (value: ForceReason) => !NEEDS_AP.includes(value) || spent > 0;

  const confirm = () => {
    run(
      forceAction(action.id, reason, note.trim() || undefined, auth).then((updated) => {
        updateAction(updated);
        refreshActorRounds();
        notify.success(t('action-forced'));
        onClose();
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      title={t('force-resolution')}
      maxWidth="xs"
      fullScreen={false}
      onDismiss={onClose}
      buttons={
        <>
          <Button onClick={onClose}>{t('cancel')}</Button>
          <Button variant="contained" onClick={confirm} disabled={busy || !allowed(reason)}>
            {t('force-resolution')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {t('force-resolution-help')}
        </Typography>
        <RadioGroup
          value={reason}
          onChange={(e) => setReason(e.target.value as ForceReason)}
          aria-label={t('force-reason')}
        >
          {OPEN_ACTION_FORCE_REASONS.map((value) => (
            <FormControlLabel
              key={value}
              value={value}
              disabled={!allowed(value)}
              control={<Radio size="small" />}
              label={
                <Stack sx={{ py: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {t(`force-reason-${value}`)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {allowed(value) ? t(`force-reason-${value}-help`) : t('err-action-force-needs-ap')}
                  </Typography>
                </Stack>
              }
            />
          ))}
        </RadioGroup>
        <TextField
          label={t('note')}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 500 } }}
        />
      </Stack>
    </RmuDialog>
  );
};

export default ForceResolutionDialog;
