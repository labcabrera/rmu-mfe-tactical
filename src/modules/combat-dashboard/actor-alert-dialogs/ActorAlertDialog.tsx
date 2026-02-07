import React, { FC, useEffect, useState } from 'react';
import { Slide } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { t } from 'i18next';
import { ActorRound, ActorRoundAlert } from '../../api/actor-rounds.dto';
import ActorAlertForm from './ActorAlertForm';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide children={undefined} direction="up" ref={ref} {...props} />;
});

const ActorAlertDialog: FC<{
  actorRound: ActorRound;
  alertId: string;
  open: boolean;
  onClose: () => void;
  onSave?: (updated: ActorRoundAlert) => void;
}> = ({ actorRound, alertId, open, onClose, onSave }) => {
  const [currentAlert, setCurrentAlert] = useState<ActorRoundAlert | undefined>(
    actorRound.alerts?.find((a) => a.id === alertId)
  );

  useEffect(() => {
    setCurrentAlert(actorRound.alerts?.find((a) => a.id === alertId));
  }, [actorRound, alertId]);

  const handleChange = (updated: ActorRoundAlert) => {
    setCurrentAlert(updated);
  };

  const handleSave = () => {
    if (currentAlert) onSave?.(currentAlert);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" slots={{ transition: Transition }}>
      <DialogTitle>{t(`Alert`)}</DialogTitle>
      <DialogContent dividers>
        {currentAlert ? (
          <ActorAlertForm actorRound={actorRound} alertId={alertId} onChange={handleChange} />
        ) : (
          <div>Alert not found</div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ActorAlertDialog;
