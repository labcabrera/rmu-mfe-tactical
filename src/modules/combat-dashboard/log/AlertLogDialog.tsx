import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Stack, Typography } from '@mui/material';
import { KeyValueList, RmuDialog, useTableText } from '@labcabrera-rmu/rmu-react-shared-lib';
import { alertDetailRows, alertName, alertText, LoggedAlert } from './alert-log';

/** Read-only detail of a resolved alert of the round log (workspace spec 087): when it happened and what it left. */
const AlertLogDialog: FC<{ entry: LoggedAlert; open: boolean; onClose: () => void }> = ({ entry, open, onClose }) => {
  const { t } = useTranslation();
  const tableText = useTableText();
  const { alert, actorRound } = entry;
  const text = alertText(alert, t, tableText);
  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={alertName(alert, t)}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        <Button variant="contained" onClick={onClose}>
          {t('close')}
        </Button>
      }
    >
      <Stack spacing={1.5}>
        {text && <Typography variant="body2">{text}</Typography>}
        <KeyValueList dense rows={alertDetailRows(alert, t)} />
      </Stack>
    </RmuDialog>
  );
};

export default AlertLogDialog;
