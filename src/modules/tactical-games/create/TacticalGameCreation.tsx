/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Grid, Paper } from '@mui/material';
import {
  CreateTacticalGameDto,
  EditableAvatar,
  fetchStrategicGame,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { getAvatarImages } from '../../services/image-service';
import TacticalGameForm from '../shared/TacticalGameForm';
import TacticalGameCreationActions from './TacticalGameCreationActions';
import { useAuth } from 'react-oidc-context';

const EMPTY_GAME_TEMPLATE = {
  strategicGameId: '',
  name: '',
  actors: [],
  environment: {
    temperatureFatigueModifier: 0,
    altitudeFatigueModifier: 0,
  },
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/tactical.png`,
} as unknown as TacticalGame;

export default function TacticalGameCreation () {
  const auth = useAuth();
  const { showError } = useError();
  const params = new URLSearchParams(window.location.search);
  const strategicGameId = params.get('strategicGame');
  const [formData, setFormData] = useState<TacticalGame>(EMPTY_GAME_TEMPLATE);
  const [isValid, setIsValid] = useState(false);
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();

  const validateForm = (formData: CreateTacticalGameDto) => {
    if (!formData.name || formData.name === '') return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId, auth)
      .then((response) => setStrategicGame(response))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      const imageUrl = strategicGame.imageUrl || `${imageBaseUrl}images/generic/tactical.png`;
      setFormData({ ...formData!, strategicGameId: strategicGame.id, imageUrl: imageUrl });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (strategicGameId) {
      bindStrategicGame(strategicGameId);
    }
  }, [strategicGameId]);

  if (!formData) return <p>Loading...</p>;

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={formData.imageUrl || `${imageBaseUrl}images/generic/tactical.png`}
            images={getAvatarImages()}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <TacticalGameCreationActions formData={formData} isValid={isValid} />
          <Paper sx={{p:2}}>
          <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
          </Paper>
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
            <pre>StrategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

