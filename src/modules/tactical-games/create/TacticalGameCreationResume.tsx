import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import type { StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-games';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameCreationResume: FC<{
  formData: CreateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<CreateTacticalGameDto>>;
  strategicGames: StrategicGame[];
}> = ({ formData, setFormData, strategicGames }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          variant="standard"
          name="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          error={!formData.name || formData.name.trim() === ''}
        />
      </Grid>
      <Grid size={12}>
        <SelectStrategicGame
          value={formData.strategicGameId}
          onChange={(e) => setFormData({ ...formData, strategicGameId: e })}
          strategicGames={strategicGames}
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameCreationResume;
