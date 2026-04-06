/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Grid, TextField } from '@mui/material';
import { fetchStrategicGames, NumericInput, StrategicGame, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameForm: FC<{
  formData: TacticalGame;
  setFormData: Dispatch<SetStateAction<TacticalGame>>;
  strategicGame: StrategicGame | undefined;
}> = ({ formData, setFormData, strategicGame }) => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 50)
      .then((response) => setStrategicGames(response.content))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (!strategicGame) {
      bindStrategicGames();
    }
  }, [strategicGame]);

  return (
    <Grid container spacing={1}>
      <Grid size={12}>
        <TextField
          label={t('Name')}
          name="tactical-game-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          fullWidth
          error={!formData.name || formData.name.trim() === ''}
        />
      </Grid>
      {!strategicGame && (
        <Grid size={12}>
          <SelectStrategicGame
            value={formData.strategicGameId}
            onChange={(e) => setFormData({ ...formData, strategicGameId: e || '' })}
            strategicGames={strategicGames}
          />
        </Grid>
      )}

      <Grid size={2}>
        <NumericInput
          label="Temperature fatigue modifier"
          value={formData.environment?.temperatureFatigueModifier || null}
          onChange={(value) =>
            setFormData({
              ...formData,
              environment: { ...formData.environment, temperatureFatigueModifier: value || 0 },
            })
          }
        />
      </Grid>
      <Grid size={2}>
        <NumericInput
          label="Altitude fatigue modifier"
          value={formData.environment?.altitudeFatigueModifier || null}
          onChange={(value) =>
            setFormData({
              ...formData,
              environment: { ...formData.environment, altitudeFatigueModifier: value || 0 },
            })
          }
        />
      </Grid>
      <Grid size={12}>
        <TextField
          label={t('Description')}
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          fullWidth
          multiline
          rows={4}
        />
      </Grid>
    </Grid>
  );
};

export default TacticalGameForm;
