/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
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

const TacticalGameCreation: FC = () => {
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
    fetchStrategicGame(strategicGameId)
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
          <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
            <pre>StrategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameCreation;
