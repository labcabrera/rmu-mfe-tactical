/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, TextField } from '@mui/material';
import {
  fetchStrategicGames,
  NumericInput,
  StrategicGame,
  TacticalGame,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import SelectStrategicGame from '../../shared/selects/SelectStrategicGame';

const TacticalGameForm: FC<{
  formData: TacticalGame;
  setFormData: (formData: TacticalGame) => void;
  strategicGame: StrategicGame | undefined;
}> = ({ formData, setFormData, strategicGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useNotify();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);

  const bindStrategicGames = () => {
    fetchStrategicGames('', 0, 50, auth)
      .then((response) => setStrategicGames(response.content))
      .catch((err) => notify.error(err));
  };

  useEffect(() => {
    if (!strategicGame) {
      bindStrategicGames();
    }
  }, [strategicGame]);

  return (
    <Grid container spacing={2}>
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
            onChange={(e) => setFormData({ ...formData, strategicGameId: e || '' })}
            strategicGames={strategicGames}
          />
        </Grid>
      )}

      <Grid size={{ xs: 6, md: 2 }}>
        <NumericInput
          label={t('temperature-fatigue-modifier')}
          value={formData.environment?.temperatureFatigueModifier || 0}
          onChange={(value) =>
            setFormData({
              ...formData,
              environment: { ...formData.environment, temperatureFatigueModifier: value || 0 },
            })
          }
        />
      </Grid>
      <Grid size={{ xs: 6, md: 2 }}>
        <NumericInput
          label={t('altitude-fatigue-modifier')}
          value={formData.environment?.altitudeFatigueModifier || 0}
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
