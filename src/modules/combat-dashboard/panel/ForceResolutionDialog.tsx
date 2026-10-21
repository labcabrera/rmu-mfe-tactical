import React, { FC, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, FormControlLabel, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { forceAction } from '../../api/action';
import { Action, FORCE_REASONS, ForceReason } from '../../api/action.dto';
import { useTacticalNotify } from '../../services/notify-service';

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
  const notify = useTacticalNotify();
  const { updateAction, refreshActorRounds } = useContext(CombatContext)!;
  const spent = action.actionPoints ?? 0;
  const [reason, setReason] = useState<ForceReason>(spent > 0 ? 'withdrawal' : 'gm');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const allowed = (value: ForceReason) => !NEEDS_AP.includes(value) || spent > 0;

  const confirm = () => {
    setBusy(true);
    forceAction(action.id, reason, note.trim() || undefined, auth)
      .then((updated) => {
        updateAction(updated);
        refreshActorRounds();
        notify.success(t('action-forced'));
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={open}
      title={t('force-resolution')}
      maxWidth="xs"
      fullScreen={false}
      onClose={onClose}
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
          {FORCE_REASONS.map((value) => (
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
