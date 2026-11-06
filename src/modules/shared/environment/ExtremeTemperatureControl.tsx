import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Box, Button, Chip, MenuItem, Stack, TextField } from '@mui/material';
import {
  EXTREME_COLD_MAX,
  EXTREME_HEAT_MIN,
  GameExtremeTemperature,
  NumberPadField,
  RmuDialog,
  RuleHint,
  TacticalGame,
  TEMPERATURE_CRITICAL_TYPES,
  TEMPERATURE_KINDS,
  TEMPERATURE_SEVERITIES,
  TemperatureKind,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { formSeverity } from '../../actor-round/hazards/TemperatureHazardDialog';
import { criticalCode } from '../../services/action-service';
import { useTacticalNotify } from '../../services/notify-service';
import { canManageTactical } from '../permissions';
import { updateGameEnvironment } from './update-environment';

type Mode = 'temperature' | 'severity';
type Form = { kind: TemperatureKind; mode: Mode; temperature: number | null; severity: string };

const formOf = (extreme: GameExtremeTemperature | null | undefined): Form => ({
  kind: extreme?.kind ?? 'cold',
  mode: extreme?.severity ? 'severity' : 'temperature',
  temperature: extreme?.temperature ?? null,
  severity: extreme?.severity ?? 'A',
});

/** The extreme temperature of a game in one line: "Cold · -80 °C · OB". */
export const extremeTemperatureLabel = (
  extreme: GameExtremeTemperature,
  t: (key: string, options?: Record<string, unknown>) => string
): string =>
  [
    t(`temperature-kind-${extreme.kind}`),
    extreme.temperature !== null && extreme.temperature !== undefined ? `${extreme.temperature} °C` : null,
    extreme.criticalType && extreme.criticalSeverity
      ? criticalCode(extreme.criticalType, extreme.criticalSeverity)
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * Extreme temperature of a tactical game (workspace spec 079, C3, §15.3): while it is set, every upkeep raises the
 * critical of cold, heat or steam of each actor the game master did not mark protected. The chip shows it; the game
 * master sets it from a temperature (Table 15-3) or a severity, or clears it.
 */
const ExtremeTemperatureControl: FC<{ game: TacticalGame; onChange: (game: TacticalGame) => void }> = ({
  game,
  onChange,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const extreme = game.environment?.extremeTemperature ?? null;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => formOf(extreme));
  const [busy, setBusy] = useState(false);
  const readOnly = !canManageTactical(game) || game.status === 'finished';

  useEffect(() => {
    if (open) setForm(formOf(extreme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const change = (patch: Partial<Form>) => setForm((prev) => ({ ...prev, ...patch }));
  const severity = formSeverity(form);

  const save = (value: GameExtremeTemperature | null) => {
    setBusy(true);
    updateGameEnvironment(game, { extremeTemperature: value }, auth)
      .then((updated) => {
        onChange(updated);
        notify.success(t('extreme-temperature-updated'));
        setOpen(false);
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  const toValue = (): GameExtremeTemperature =>
    form.mode === 'temperature'
      ? { kind: form.kind, temperature: form.temperature, severity: null }
      : { kind: form.kind, temperature: null, severity: form.severity };

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
      <RuleHint title={t('extreme-temperature')} description={t('extreme-temperature-help')} reference="§15.3">
        <Chip
          size="small"
          icon={<ThermostatIcon />}
          color={extreme ? 'error' : 'default'}
          variant={extreme ? 'filled' : 'outlined'}
          label={extreme ? extremeTemperatureLabel(extreme, t) : t('extreme-temperature-none')}
          sx={{ cursor: 'inherit' }}
        />
      </RuleHint>
      {!readOnly && (
        <Button size="small" onClick={() => setOpen(true)}>
          {t('edit')}
        </Button>
      )}
      <RmuDialog
        open={open}
        onDismiss={() => setOpen(false)}
        maxWidth="sm"
        title={t('extreme-temperature')}
        buttons={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            {t('cancel')}
          </Button>,
          ...(extreme
            ? [
                <Button key="clear" color="inherit" disabled={busy} onClick={() => save(null)}>
                  {t('extreme-temperature-clear')}
                </Button>,
              ]
            : []),
          <Button key="save" variant="contained" disabled={busy || !severity} onClick={() => save(toValue())}>
            {t('save')}
          </Button>,
        ]}
      >
        <Stack spacing={2}>
          <RuleHint
            title={t('extreme-temperature')}
            description={t('hazard-temperature-help', { cold: EXTREME_COLD_MAX, heat: EXTREME_HEAT_MIN })}
            reference="§15.3"
          >
            <Box sx={{ color: 'text.secondary', typography: 'body2' }}>{t('extreme-temperature-help')}</Box>
          </RuleHint>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'flex-start' }}>
            <TextField
              select
              size="small"
              label={t('temperature-kind')}
              value={form.kind}
              onChange={(e) => change({ kind: e.target.value as TemperatureKind })}
              sx={{ minWidth: 160 }}
            >
              {TEMPERATURE_KINDS.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(`temperature-kind-${kind}`)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label={t('temperature-severity-mode')}
              value={form.mode}
              onChange={(e) => change({ mode: e.target.value as Mode })}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="temperature">{t('temperature-severity-mode-temperature')}</MenuItem>
              <MenuItem value="severity">{t('temperature-severity-mode-severity')}</MenuItem>
            </TextField>
            {form.mode === 'temperature' ? (
              <Box sx={{ width: 200 }}>
                <NumberPadField
                  label={t('temperature-celsius')}
                  value={form.temperature}
                  onChange={(temperature) => change({ temperature })}
                  steps={[-50, -10, 10, 50]}
                  suffix="°C"
                  error={form.temperature !== null && !severity}
                  helperText={form.temperature !== null && !severity ? t('temperature-not-extreme') : undefined}
                />
              </Box>
            ) : (
              <TextField
                select
                size="small"
                label={t('critical-severity')}
                value={form.severity}
                onChange={(e) => change({ severity: e.target.value })}
                sx={{ minWidth: 120 }}
              >
                {TEMPERATURE_SEVERITIES.map((each) => (
                  <MenuItem key={each} value={each}>
                    {each}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
          <Chip
            size="small"
            variant="outlined"
            color={severity ? 'error' : 'default'}
            label={t('extreme-temperature-each-round', {
              code: severity ? criticalCode(TEMPERATURE_CRITICAL_TYPES[form.kind], severity) : '—',
            })}
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
      </RmuDialog>
    </Stack>
  );
};

export default ExtremeTemperatureControl;
