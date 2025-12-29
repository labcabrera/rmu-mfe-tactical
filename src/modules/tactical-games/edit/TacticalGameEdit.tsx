import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGame, type TacticalGame, type UpdateTacticalGameDto } from '../../api/tactical-games';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import TacticalGameEditActions from './TacticalGameEditActions';
import TacticalGameEditAttributes from './TacticalGameEditAttributes';
import TacticalGameEditResume from './TacticalGameEditResume';

const TacticalGameEdit: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame | null>(null);
  const [formData, setFormData] = useState<UpdateTacticalGameDto | null>(null);
  const [isValid, setIsValid] = useState(false);

  const validateForm = (formData: UpdateTacticalGameDto) => {
    if (!formData.name) return false;
    return true;
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (tacticalGame) {
      setFormData({
        name: tacticalGame.name,
        description: tacticalGame.description || '',
      });
    }
  }, [tacticalGame]);

  useEffect(() => {
    if (location.state && location.state.realm) {
      setTacticalGame(location.state.tacticalGame);
    } else if (gameId) {
      fetchTacticalGame(gameId)
        .then((response) => setTacticalGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!tacticalGame || !formData) return <div>Loading tactical game...</div>;

  return (
    <>
      <TacticalGameEditActions tacticalGame={tacticalGame} formData={formData} isValid={isValid} />
      <Grid container spacing={2}>
        <Grid size={2}>
          <GenericAvatar imageUrl="/static/images/generic/tactical.png" size={300} />
          <TacticalGameEditResume formData={formData} setFormData={setFormData} />
        </Grid>
        <Grid size={10}>
          <TacticalGameEditAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameEdit;
