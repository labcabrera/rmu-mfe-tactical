/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid, MenuItem, TextField } from '@mui/material';
import {
  fetchStrategicGames,
  NumberPadField,
  StrategicGame,
  StrategicGamePicker,
  TacticalGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { PSYCHOLOGY_RULES, PsychologyRules, TacticalGameWithSides } from '../../api/tactical-game-sides.dto';

/** Data of a tactical game. Its fatigue modifiers are not asked on creation: the game gets them once it exists. */
const TacticalGameForm: FC<{
  mode: 'create' | 'edit';
  formData: TacticalGame;
  setFormData: (formData: TacticalGame) => void;
  strategicGame: StrategicGame | undefined;
}> = ({ mode, formData, setFormData, strategicGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const notify = useApiNotify();
  const strategicGamesQuery = useQuery<StrategicGame[], Error>({
    queryKey: ['tactical-game-form', 'strategic-games'],
    queryFn: () => fetchStrategicGames('', 0, 50, auth).then((response) => response.content),
    enabled: !strategicGame,
    gcTime: 0,
  });
  const strategicGames = strategicGamesQuery.data ?? [];
  // Workspace spec 100, decision 18: the rules of fear and morale, fixed once the game starts.
  const psychologyRules = (formData as TacticalGameWithSides).psychologyRules ?? 'book';
  const rulesEditable = mode === 'create' || formData.status === 'created';

  useEffect(() => {
    if (strategicGamesQuery.error) notify.error(strategicGamesQuery.error);
  }, [strategicGamesQuery.error]);

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
          <StrategicGamePicker
            variant="select"
            games={strategicGames}
            value={formData.strategicGameId}
            onChange={(id) => setFormData({ ...formData, strategicGameId: id || '' })}
            required
            error={!formData.strategicGameId}
          />
        </Grid>
      )}

      {mode === 'edit' && (
        <>
          <Grid size={{ xs: 6, md: 2 }}>
            <NumberPadField
              steps={[-10, -5, 5, 10]}
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
            <NumberPadField
              steps={[-10, -5, 5, 10]}
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
        </>
      )}
      <Grid size={12}>
        <TextField
          select
          label={t('psychology-rules')}
          name="psychology-rules"
          value={psychologyRules}
          onChange={(e) =>
            setFormData({ ...formData, psychologyRules: e.target.value as PsychologyRules } as TacticalGameWithSides)
          }
          disabled={!rulesEditable}
          helperText={t(rulesEditable ? `psychology-rules-${psychologyRules}-help` : 'psychology-rules-locked-help')}
          fullWidth
        >
          {PSYCHOLOGY_RULES.map((rules) => (
            <MenuItem key={rules} value={rules}>
              {t(`psychology-rules-${rules}`)}
            </MenuItem>
          ))}
        </TextField>
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
