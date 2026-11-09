import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { MenuItem, TextField } from '@mui/material';
import {
  LIGHT_TYPES,
  LightType,
  TacticalGame,
  updateTacticalGame,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useBusyAction } from '../../hooks/useBusyAction';
import { canManageTactical } from '../permissions';

const NONE = '';

/**
 * Ambient light of a tactical game (workspace spec 076, P6), which the game master changes during the game: the
 * default light of every maneuver and movement (each roll may still choose another) and the light Light Sensitivity
 * reads in combat. The environment is sent whole, since the API replaces its fatigue modifiers.
 */
const AmbientLightSelect: FC<{
  game: TacticalGame;
  onChange: (game: TacticalGame) => void;
  fullWidth?: boolean;
  /** Size of the field; the theme's by default (the combat header passes `small`). */
  size?: 'small' | 'medium';
}> = ({ game, onChange, fullWidth = false, size }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { busy, run } = useBusyAction();
  const value = game.environment?.light ?? NONE;
  const readOnly = !canManageTactical(game) || game.status === 'finished';

  const change = (light: LightType | null) => {
    run(
      updateTacticalGame(
        game.id,
        {
          environment: {
            temperatureFatigueModifier: game.environment?.temperatureFatigueModifier ?? 0,
            altitudeFatigueModifier: game.environment?.altitudeFatigueModifier ?? 0,
            light,
          },
        },
        auth
      ).then((updated) => {
        onChange(updated);
        notify.success(t('ambient-light-updated'));
      })
    );
  };

  return (
    <TextField
      select
      size={size}
      label={t('ambient-light')}
      value={value}
      onChange={(event) => change((event.target.value || null) as LightType | null)}
      disabled={busy || readOnly}
      fullWidth={fullWidth}
      sx={fullWidth ? undefined : { minWidth: 180 }}
    >
      <MenuItem value={NONE}>{t('ambient-light-none')}</MenuItem>
      {LIGHT_TYPES.map((light) => (
        <MenuItem key={light} value={light}>
          {t(light)}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default AmbientLightSelect;
