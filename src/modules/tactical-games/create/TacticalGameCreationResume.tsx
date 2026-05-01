import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid, TextField } from '@mui/material';
import { StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameCreationResume: FC<{
  formData: TacticalGame;
  setFormData: Dispatch<SetStateAction<TacticalGame>>;
  strategicGames: StrategicGame[];
}> = ({ formData, setFormData, strategicGames }) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <TextField
          label={t('name')}
          variant="standard"
          name="tactical-game-name"
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
