import React, { ChangeEvent, Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import type { StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-games';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameCreationAttributes: FC<{
  formData: CreateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<CreateTacticalGameDto>>;
  strategicGames: StrategicGame[];
}> = ({ formData, setFormData, strategicGames }) => {
  const { t } = useTranslation();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGameChange = (gameId: string) => {
    setFormData({ ...formData, strategicGameId: gameId });
  };

  return (
    <Grid container spacing={2}>
      <Grid size={4}>
        <SelectStrategicGame value={formData.strategicGameId} onChange={handleGameChange} strategicGames={strategicGames} />
      </Grid>
      <Grid size={8}></Grid>
      <Grid size={4}>
        <TextField label={t('name')} variant="standard" name="name" value={formData.name} onChange={handleChange} required fullWidth />
      </Grid>
      <Grid size={8}></Grid>
      <Grid size={4}>
        <TextField label={t('description')} variant="standard" name="description" value={formData.description} onChange={handleChange} fullWidth />
      </Grid>
      <Grid size={8}></Grid>
    </Grid>
  );
};

export default TacticalGameCreationAttributes;
