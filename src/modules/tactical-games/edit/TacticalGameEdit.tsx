/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  EditableAvatar,
  emptyTacticalGame,
  fetchStrategicGame,
  fetchTacticalGame,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  UpdateTacticalGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { defaultImage, getAvatarImages } from '../../services/image-service';
import TacticalGameForm from '../shared/TacticalGameForm';
import TacticalGameEditActions from './TacticalGameEditActions';

const TacticalGameEdit: FC = () => {
  const location = useLocation();
  const { showError } = useError();
  const { gameId } = useParams<{ gameId?: string }>();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [formData, setFormData] = useState<TacticalGame>(emptyTacticalGame);
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
      setFormData(tacticalGame);
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
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <EditableAvatar
          imageUrl={formData.imageUrl || defaultImage}
          images={getAvatarImages()}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
        />
      </Grid>
      <Grid size={gridSizeMain}>
        <TacticalGameEditActions tacticalGame={tacticalGame} formData={formData} isValid={isValid} />
        <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
        <TechnicalInfo>
          <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
        </TechnicalInfo>
      </Grid>
    </Grid>
  );
};

export default TacticalGameEdit;
