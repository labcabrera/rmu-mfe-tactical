import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import FlashlightOnIcon from '@mui/icons-material/FlashlightOn';
import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import {
  LIGHT_SOURCES,
  LightSource,
  lightAtDistance,
  LightType,
  NumberPadField,
  RmuDialog,
  RuleHint,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useTacticalNotify } from '../../services/notify-service';
import { canManageTactical } from '../permissions';
import EnvironmentDialogField from './EnvironmentDialogField';
import { updateGameEnvironment } from './update-environment';

type Calculation = { source: LightSource; distance: number | null };

/**
 * Light of a source at a distance (workspace spec 079, C5, §15.7): there are no positions in the game, so this only
 * tells the game master the light level to pick (a candle, a torch, a lantern or a bonfire within 10', one level darker
 * to 30', two to 100', three to 300'). The ambient light wins when it is brighter.
 */
export const LightSourceCalculator: FC<{
  value: Calculation;
  onChange: (value: Calculation) => void;
  light: LightType | null;
}> = ({ value, onChange, light }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <RuleHint title={t('light-source-calculator')} description={t('light-source-calculator-help')} reference="§15.7">
        <Box sx={{ color: 'text.secondary', typography: 'body2' }}>{t('light-source-calculator-help')}</Box>
      </RuleHint>
      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <TextField
          select
          label={t('light-source')}
          value={value.source}
          onChange={(e) => onChange({ ...value, source: e.target.value as LightSource })}
          sx={{ minWidth: 180 }}
        >
          {LIGHT_SOURCES.map((each) => (
            <MenuItem key={each} value={each}>
              {t(`light-source-${each}`)}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ width: 200 }}>
          <NumberPadField
            label={t('light-source-distance')}
            value={value.distance}
            onChange={(distance) => onChange({ ...value, distance })}
            min={0}
            allowNegatives={false}
            steps={[-10, -5, 5, 10]}
          />
        </Box>
      </Stack>
      <Chip
        variant="outlined"
        color={light ? 'info' : 'default'}
        label={light ? t('light-source-result', { light: t(light) }) : t('light-source-out-of-range')}
        sx={{ alignSelf: 'flex-start' }}
      />
    </Stack>
  );
};

/**
 * The light source of a tactical game, shown like the extreme temperature: a field with the last light applied from a
 * source that opens the calculator. The game master can apply its result as the ambient light; the source
 * itself is not stored in the game.
 */
const LightSourceControl: FC<{ game: TacticalGame; onChange: (game: TacticalGame) => void }> = ({ game, onChange }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const ambient = game.environment?.light ?? null;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Calculation>({ source: 'torch', distance: 10 });
  const [applied, setApplied] = useState<Calculation & { light: LightType }>();
  const [busy, setBusy] = useState(false);
  const readOnly = !canManageTactical(game) || game.status === 'finished';
  const light = form.distance !== null ? lightAtDistance(form.source, form.distance, ambient) : null;
  // The chip only keeps the calculation while the ambient light is still its result
  const shown = applied && applied.light === ambient ? applied : undefined;

  const apply = () => {
    if (!light) return;
    setBusy(true);
    updateGameEnvironment(game, { light }, auth)
      .then((updated) => {
        onChange(updated);
        setApplied({ ...form, light });
        notify.success(t('ambient-light-updated'));
        setOpen(false);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <>
      <EnvironmentDialogField
        label={t('light-source-calculator')}
        icon={<FlashlightOnIcon />}
        active={!!shown}
        value={
          shown
            ? t('light-source-applied', {
                source: t(`light-source-${shown.source}`),
                distance: shown.distance,
                light: t(shown.light),
              })
            : t('light-source-none')
        }
        onOpen={() => setOpen(true)}
      />
      <RmuDialog
        open={open}
        onDismiss={() => setOpen(false)}
        maxWidth="sm"
        title={t('light-source-calculator')}
        buttons={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            {t(readOnly ? 'close' : 'cancel')}
          </Button>,
          ...(readOnly
            ? []
            : [
                <Button key="apply" variant="contained" disabled={busy || !light} onClick={apply}>
                  {t('light-source-apply')}
                </Button>,
              ]),
        ]}
      >
        <LightSourceCalculator value={form} onChange={setForm} light={light} />
      </RmuDialog>
    </>
  );
};

export default LightSourceControl;
