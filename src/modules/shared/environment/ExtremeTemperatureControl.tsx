import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { Box, Button, Chip, Grid, MenuItem, Stack, TextField } from '@mui/material';
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
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import type { TFunction } from 'i18next';
import { useBusyAction } from '../../hooks/useBusyAction';
import { criticalCode } from '../../services/action-service';
import { formSeverity } from '../../services/temperature-severity';
import { canManageTactical } from '../permissions';
import EnvironmentDialogField from './EnvironmentDialogField';
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
const extremeTemperatureLabel = (extreme: GameExtremeTemperature, t: TFunction): string =>
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
 * critical of cold, heat or steam of each actor the game master did not mark protected. A field like the environment selects shows it; the game
 * master sets it from a temperature (Table 15-3) or a severity, or clears it.
 */
const ExtremeTemperatureControl: FC<{ game: TacticalGame; onChange: (game: TacticalGame) => void }> = ({
  game,
  onChange,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const extreme = game.environment?.extremeTemperature ?? null;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(() => formOf(extreme));
  const { busy, run } = useBusyAction();
  const readOnly = !canManageTactical(game) || game.status === 'finished';

  useEffect(() => {
    if (open) setForm(formOf(extreme));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const change = (patch: Partial<Form>) => setForm((prev) => ({ ...prev, ...patch }));
  const severity = formSeverity(form);

  const save = (value: GameExtremeTemperature | null) => {
    run(
      updateGameEnvironment(game, { extremeTemperature: value }, auth).then((updated) => {
        onChange(updated);
        notify.success(t('extreme-temperature-updated'));
        setOpen(false);
      })
    );
  };

  const toValue = (): GameExtremeTemperature =>
    form.mode === 'temperature'
      ? { kind: form.kind, temperature: form.temperature, severity: null }
      : { kind: form.kind, temperature: null, severity: form.severity };

  return (
    <>
      <EnvironmentDialogField
        label={t('extreme-temperature')}
        icon={<ThermostatIcon />}
        active={!!extreme}
        color="error"
        value={extreme ? extremeTemperatureLabel(extreme, t) : t('extreme-temperature-none')}
        onOpen={readOnly ? undefined : () => setOpen(true)}
      />
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label={t('temperature-kind')}
                value={form.kind}
                onChange={(e) => change({ kind: e.target.value as TemperatureKind })}
              >
                {TEMPERATURE_KINDS.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {t(`temperature-kind-${kind}`)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                select
                fullWidth
                label={t('temperature-severity-mode')}
                value={form.mode}
                onChange={(e) => change({ mode: e.target.value as Mode })}
              >
                <MenuItem value="temperature">{t('temperature-severity-mode-temperature')}</MenuItem>
                <MenuItem value="severity">{t('temperature-severity-mode-severity')}</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              {form.mode === 'temperature' ? (
                <>
                  <NumberPadField
                    label={t('temperature-celsius')}
                    value={form.temperature}
                    onChange={(temperature) => change({ temperature })}
                    steps={[-50, -10, 10, 50]}
                    suffix="°C"
                    error={form.temperature !== null && !severity}
                    helperText={form.temperature !== null && !severity ? t('temperature-not-extreme') : undefined}
                  />
                </>
              ) : (
                <TextField
                  select
                  fullWidth
                  label={t('critical-severity')}
                  value={form.severity}
                  onChange={(e) => change({ severity: e.target.value })}
                >
                  {TEMPERATURE_SEVERITIES.map((each) => (
                    <MenuItem key={each} value={each}>
                      {each}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            </Grid>
          </Grid>
          <Chip
            variant="outlined"
            color={severity ? 'error' : 'default'}
            label={t('extreme-temperature-each-round', {
              code: severity ? criticalCode(TEMPERATURE_CRITICAL_TYPES[form.kind], severity) : '—',
            })}
            sx={{ alignSelf: 'flex-start' }}
          />
        </Stack>
      </RmuDialog>
    </>
  );
};

export default ExtremeTemperatureControl;
