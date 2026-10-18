import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { LoadingState, RmuDialog } from '@labcabrera-rmu/rmu-react-shared-lib';
import ActorRoundView from '../../actor-round/ActorRoundView';
import { ActorRound } from '../../api/actor-rounds.dto';

const ActorRoundViewDialog: FC<{
  open: boolean;
  actorRound?: ActorRound | null;
  onClose: () => void;
}> = ({ open, actorRound, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCharacterClick = () => {
    if (actorRound?.actorId) {
      navigate(`/strategic/characters/view/${actorRound.actorId}`);
    }
  };

  return (
    <RmuDialog
      title={actorRound?.actorName || t('actor-round')}
      avatarImg={actorRound?.imageUrl || '/static/images/races/unknown.png'}
      open={open}
      onClose={onClose}
      maxWidth="xl"
      buttons={<>{actorRound?.actorId && <Button onClick={handleCharacterClick}>{t('view-character')}</Button>}</>}
    >
      {actorRound ? <ActorRoundView key={actorRound.id} actorRound={actorRound} /> : <LoadingState />}
    </RmuDialog>
  );
};

export default ActorRoundViewDialog;
