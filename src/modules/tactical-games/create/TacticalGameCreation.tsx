/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { EditableAvatar, TechnicalInfo } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGame } from '../../api/strategic-games';
import type { StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-game.dto';
import { createGameTemplate } from '../../data/tactical-game-data';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { defaultImage, getAvatarImages } from '../../services/image-service';
import TacticalGameForm from '../shared/TacticalGameForm';
import TacticalGameCreationActions from './TacticalGameCreationActions';

const TacticalGameCreation: FC = () => {
  const { showError } = useError();
  const params = new URLSearchParams(window.location.search);
  const strategicGameId = params.get('strategicGame');

  const [formData, setFormData] = useState<CreateTacticalGameDto | undefined>({ ...createGameTemplate });
  const [isValid, setIsValid] = useState(false);
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();

  const validateForm = (formData: CreateTacticalGameDto) => {
    if (!formData.name) return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId)
      .then((response) => {
        setStrategicGame(response);
        setFormData({ ...formData, strategicGameId: response.id });
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (strategicGameId) {
      bindStrategicGame(strategicGameId);
    }
  }, [strategicGameId]);

  if (!formData) return <p>Loading...</p>;

  return (
    <>
      <TacticalGameCreationActions formData={formData} isValid={isValid} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <EditableAvatar
            imageUrl={formData.imageUrl || defaultImage}
            images={getAvatarImages()}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
          />
        </Grid>
        <Grid size={gridSizeMain}>
          <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
          <TechnicalInfo>
            <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
          </TechnicalInfo>
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameCreation;
