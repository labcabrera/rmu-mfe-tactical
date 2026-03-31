import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Grid, TextField } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames, StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-game.dto';
import { NumericInput } from '../../shared/inputs/NumericInput';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameForm: FC<{
  formData: CreateTacticalGameDto;
  setFormData: Dispatch<SetStateAction<CreateTacticalGameDto | undefined>>;
  strategicGame: StrategicGame | undefined;
}> = ({ formData, setFormData, strategicGame }) => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 20)
      .then((response) => setStrategicGames(response))
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
          label={t('name')}
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
            onChange={(e) => setFormData({ ...formData, strategicGameId: e })}
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
          label={t('description')}
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
