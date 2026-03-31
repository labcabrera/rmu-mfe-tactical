import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame, StrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-game';
import { TacticalGame, UpdateTacticalGameDto } from '../../api/tactical-game.dto';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import TechnicalInfo from '../../shared/display/TechnicalInfo';
import TacticalGameForm from '../shared/TacticalGameForm';
import TacticalGameEditActions from './TacticalGameEditActions';

const TacticalGameEdit: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<UpdateTacticalGameDto>();
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
        description: tacticalGame.description,
        environment: tacticalGame.environment,
      });
      fetchStrategicGame(tacticalGame.strategicGameId)
        .then((response) => setStrategicGame(response))
        .catch((err) => showError(err.message));
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
        </Grid>
        <Grid size={10}>
          <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameEdit;
