import React from 'react';
import { useTranslation } from 'react-i18next';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameCreationAttributes = ({ formData, setFormData, strategicGames }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGameChange = (gameId, game) => {
    setFormData({ ...formData, strategicGameId: gameId });
  };

  return (
    <Grid container spacing={2}>
      <Grid item size={4}>
        <SelectStrategicGame value={formData.strategicGameId} onChange={handleGameChange} strategicGames={strategicGames} />
      </Grid>
      <Grid item size={8}></Grid>
      <Grid item size={4}>
        <TextField label={t('name')} variant="outlined" name="name" value={formData.name} onChange={handleChange} required fullWidth />
      </Grid>
      <Grid item size={8}></Grid>
      <Grid item size={4}>
        <TextField label={t('description')} variant="outlined" name="description" value={formData.description} onChange={handleChange} fullWidth />
      </Grid>
      <Grid item size={8}></Grid>
    </Grid>
  );
};

export default TacticalGameCreationAttributes;
