import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  ChipRow,
  D100,
  EXTREME_COLD_MAX,
  EXTREME_HEAT_MIN,
  EXTREME_TEMPERATURE_HAZARD,
  HAZARD_MAX_CRITICAL_ROLLS,
  NumberPadField,
  ResolveTemperatureHazardDto,
  RmuDialog,
  RollField,
  RuleHint,
  TEMPERATURE_CRITICAL_TYPES,
  TEMPERATURE_KINDS,
  TEMPERATURE_SEVERITIES,
  TemperatureKind,
  useApiNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { resolveHazard } from '../../api/actor-rounds';
import { ActorRound, ActorRoundHazard } from '../../api/actor-rounds.dto';
import { useCombatActions } from '../../combat/combat-context';
import { useBusyAction } from '../../hooks/useBusyAction';
import { criticalCode } from '../../services/action-service';
import { formSeverity, SeverityMode } from '../../services/temperature-severity';
import HazardResult from './HazardResult';

type TemperatureForm = {
  kind: TemperatureKind;
  mode: SeverityMode;
  temperature: number | null;
  severity: string;
  criticalRolls: (number | null)[];
  note: string;
};

const emptyForm = (): TemperatureForm => ({
  kind: 'cold',
  mode: 'temperature',
  temperature: null,
  severity: 'A',
  criticalRolls: [],
  note: '',
});

const toDto = (form: TemperatureForm): ResolveTemperatureHazardDto => {
  const criticalRolls = form.criticalRolls.filter((roll): roll is number => roll !== null);
  return {
    kind: EXTREME_TEMPERATURE_HAZARD,
    temperatureKind: form.kind,
    ...(form.mode === 'temperature' ? { temperature: form.temperature } : { severity: form.severity }),
    ...(criticalRolls.length > 0 ? { criticalRolls } : {}),
    ...(form.note.trim() ? { note: form.note.trim() } : {}),
  };
};

/**
 * An extreme temperature on an actor (workspace spec 079, C3, §15.3; game master only): cold, heat or steam, with its
 * temperature in °C (Table 15-3) or a severity set by the game master for a contact. There is no attack roll: only the
 * critical (several above E), rolled here or left as critical alerts of the actor.
 */
const TemperatureHazardDialog: FC<{ actorRound: ActorRound; open: boolean; onClose: () => void }> = ({
  actorRound,
  open,
  onClose,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const { updateActorRound } = useCombatActions();
  const [form, setForm] = useState<TemperatureForm>(emptyForm);
  const { busy, run } = useBusyAction();
  const [result, setResult] = useState<ActorRoundHazard | undefined>();

  useEffect(() => {
    if (open) {
      setForm(emptyForm());
      setResult(undefined);
    }
  }, [open]);

  const change = (patch: Partial<TemperatureForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const severity = formSeverity(form);
  const criticalType = TEMPERATURE_CRITICAL_TYPES[form.kind];
  const ready = !!severity;
  const criticalSlots = Math.min(
    HAZARD_MAX_CRITICAL_ROLLS,
    form.criticalRolls.filter((roll) => roll !== null).length + 1
  );

  const resolve = () => {
    const before = new Set((actorRound.hazards ?? []).map((hazard) => hazard.id));
    run(
      resolveHazard(actorRound.id, toDto(form), auth).then((updated) => {
        updateActorRound(updated);
        const hazard = (updated.hazards ?? []).find((each) => !before.has(each.id));
        setResult(hazard);
        notify.success(t('hazard-temperature-resolved'));
      })
    );
  };

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      maxWidth="md"
      title={t('hazard-kind-extreme-temperature')}
      subtitle={actorRound.actorName}
      buttons={
        result
          ? [
              <Button key="close" variant="contained" onClick={onClose}>
                {t('close')}
              </Button>,
            ]
          : [
              <Button key="cancel" onClick={onClose}>
                {t('cancel')}
              </Button>,
              <Button key="resolve" variant="contained" color="error" disabled={!ready || busy} onClick={resolve}>
                {t('resolve')}
              </Button>,
            ]
      }
    >
      {result ? (
        <Stack spacing={1.5}>
          <HazardResult hazard={result} />
          {result.criticals.some((critical) => critical.alertId) && (
            <Alert severity="info" variant="outlined">
              {t('hazard-critical-alerts')}
            </Alert>
          )}
        </Stack>
      ) : (
        <Stack spacing={2}>
          <RuleHint
            title={t('hazard-kind-extreme-temperature')}
            description={t('hazard-temperature-help', { cold: EXTREME_COLD_MAX, heat: EXTREME_HEAT_MIN })}
            reference="§15.3"
          >
            <Typography variant="body2" color="text.secondary">
              {t('hazard-temperature-help', { cold: EXTREME_COLD_MAX, heat: EXTREME_HEAT_MIN })}
            </Typography>
          </RuleHint>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 2, alignItems: 'flex-start' }}>
            <TextField
              select
              size="small"
              label={t('temperature-kind')}
              value={form.kind}
              onChange={(e) => change({ kind: e.target.value as TemperatureKind })}
              sx={{ minWidth: 180 }}
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
              onChange={(e) => change({ mode: e.target.value as SeverityMode })}
              sx={{ minWidth: 220 }}
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
                sx={{ minWidth: 140 }}
              >
                {TEMPERATURE_SEVERITIES.map((each) => (
                  <MenuItem key={each} value={each}>
                    {each}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
          <ChipRow>
            <Chip
              size="small"
              color={severity ? 'error' : 'default'}
              variant="outlined"
              label={t('critical-code', { code: severity ? criticalCode(criticalType, severity) : '—' })}
            />
          </ChipRow>
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {t('hazard-critical-rolls-help')}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {Array.from({ length: criticalSlots }, (_, index) => (
                <Box key={index} sx={{ minWidth: 200, flex: 1 }}>
                  <RollField
                    spec={D100}
                    label={t('hazard-critical-roll-n', { n: index + 1 })}
                    value={form.criticalRolls[index] ?? null}
                    onChange={(roll) => {
                      const rolls = [...form.criticalRolls];
                      rolls[index] = roll.total;
                      change({ criticalRolls: rolls });
                    }}
                    onClear={() => change({ criticalRolls: form.criticalRolls.slice(0, index) })}
                  />
                </Box>
              ))}
            </Stack>
          </Stack>
          <TextField
            size="small"
            label={t('note')}
            value={form.note}
            onChange={(e) => change({ note: e.target.value })}
            fullWidth
          />
        </Stack>
      )}
    </RmuDialog>
  );
};

export default TemperatureHazardDialog;
