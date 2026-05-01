import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  DialogContent,
  FormControlLabel,
  FormGroup,
  Switch,
  ListItemButton,
} from '@mui/material';
import { ActionAttack } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';

const AddProtectorDialog: FC<{
  selectedAttack: ActionAttack;
  actorRound: ActorRound;
  actorRounds: ActorRound[];
  open: boolean;
  onAdd: (actorId: string) => void;
  onClose: () => void;
}> = ({ selectedAttack, actorRound, actorRounds, open, onAdd, onClose }) => {
  const { t } = useTranslation();
  const [displayAll, setDisplayAll] = useState<boolean>(false);
  const [availableActors, setAvailableActors] = useState<ActorRound[]>([]);

  useEffect(() => {
    if (!actorRounds) return;
    let list = actorRounds.filter(
      (a) => a.actorId !== actorRound.actorId && a.actorId !== selectedAttack.modifiers.targetId
    );
    if (!displayAll) {
      list = list.filter((e) => e.factionId !== actorRound.factionId);
    }
    setAvailableActors(list);
  }, [displayAll]);

  const handleAdd = (actorId: string) => {
    onAdd(actorId);
    onClose();
  };

  return (
    <Dialog open={open} onClose={() => onClose && onClose()} fullWidth maxWidth="sm">
      <DialogTitle>{t('Select protector')}</DialogTitle>
      <DialogContent>
        <FormGroup>
          <FormControlLabel value={displayAll} control={<Switch />} label="All" onChange={(e, v) => setDisplayAll(v)} />
        </FormGroup>
        <List>
          {availableActors.map((actor, index) => {
            const isSelected = false;
            return (
              <ListItem key={index}>
                <ListItemButton selected={isSelected} onClick={() => handleAdd(actor.actorId)}>
                  <ListItemAvatar>
                    <Avatar src={actor.imageUrl || undefined} alt={actor.actorName} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={actor.actorName}
                    secondary={`${t('Protect')}: ${actor.defense?.protect ?? 0}`}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>{t('Close')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProtectorDialog;
