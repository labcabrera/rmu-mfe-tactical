import React, { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames } from '../../api/strategic-games';
import type { StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-games';
import { createGameTemplate } from '../../data/tactical-game-data';
import GenericAvatar from '../../shared/avatars/GenericAvatar';
import TacticalGameCreationActions from './TacticalGameCreationActions';
import TacticalGameCreationAttributes from './TacticalGameCreationAttributes';
import TacticalGameCreationResume from './TacticalGameCreationResume';

const TacticalGameCreation: FC = () => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const [formData, setFormData] = useState<CreateTacticalGameDto>({ ...createGameTemplate });
  const [isValid, setIsValid] = useState(false);

  const validateForm = (formData: CreateTacticalGameDto) => {
    if (!formData.name) return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    fetchStrategicGames('', 0, 20)
      .then((response) => setStrategicGames(response))
      .catch((err) => showError(err.message));
  }, [showError]);

  return (
    <>
      <TacticalGameCreationActions formData={formData} isValid={isValid} />
      <Grid container spacing={2}>
        <Grid size={2}>
          <GenericAvatar imageUrl="/static/images/generic/tactical.png" size={300} />
          <TacticalGameCreationResume formData={formData} setFormData={setFormData} strategicGames={strategicGames} />
        </Grid>
        <Grid size={10}>
          <TacticalGameCreationAttributes formData={formData} setFormData={setFormData} />
        </Grid>
      </Grid>
      {/* <pre>Form: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Strategic Games: {JSON.stringify(strategicGames, null, 2)}</pre> */}
    </>
  );
};

export default TacticalGameCreation;
