import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { MenuItem, TextField } from '@mui/material';
import { FOG_LEVELS, FOG_TABLE, FogLevel, formatBonus, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTacticalNotify } from '../../services/notify-service';
import { updateGameEnvironment } from '../environment/update-environment';
import { canManageTactical } from '../permissions';

const NONE = '';

/**
 * Fog of a tactical game (workspace spec 079, C5, Table 15-7), which the game master changes during the game: its
 * modifier goes to every visual Perception and Tracking maneuver, and hearing beyond the visual range takes -20.
 */
const FogSelect: FC<{
  game: TacticalGame;
  onChange: (game: TacticalGame) => void;
  fullWidth?: boolean;
  /** Size of the field; the theme's by default (the combat header passes `small`). */
  size?: 'small' | 'medium';
}> = ({ game, onChange, fullWidth = false, size }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [busy, setBusy] = useState(false);
  const value = game.environment?.fog ?? NONE;
  const readOnly = !canManageTactical(game) || game.status === 'finished';

  const change = (fog: FogLevel | null) => {
    setBusy(true);
    updateGameEnvironment(game, { fog }, auth)
      .then((updated) => {
        onChange(updated);
        notify.success(t('fog-updated'));
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <TextField
      select
      size={size}
      label={t('fog')}
      value={value}
      onChange={(event) => change((event.target.value || null) as FogLevel | null)}
      disabled={busy || readOnly}
      fullWidth={fullWidth}
      sx={fullWidth ? undefined : { minWidth: 160 }}
    >
      <MenuItem value={NONE}>{t('fog-none')}</MenuItem>
      {FOG_LEVELS.map((fog) => (
        <MenuItem key={fog} value={fog}>
          {t('fog-option', {
            fog: t(`fog-${fog}`),
            value: formatBonus(FOG_TABLE[fog].perception),
            feet: FOG_TABLE[fog].visibilityFeet,
          })}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default FogSelect;
