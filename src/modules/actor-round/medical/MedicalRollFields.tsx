import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Checkbox, FormControlLabel, MenuItem, Stack, TextField, Typography } from '@mui/material';
import {
  AMPUTATION_DIFFICULTY,
  AMPUTATION_INJURY_PENALTY,
  BodySide,
  D100,
  DEFIBRILLATION_DIFFICULTY_RANGE,
  formatBonus,
  Injury,
  LOST_LIMB_LOCATIONS,
  LostLimbLocation,
  NumberPadField,
  REVIVE_METHODS,
  ReviveMethod,
  RollField,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { TACTICAL_PROCEDURES, TacticalProcedure } from '../../api/actor-rounds.dto';
import { isProcedureAvailable } from './medical';
import { MedicalRollForm } from './medical-roll-rules';

type FieldsProps = {
  form: MedicalRollForm;
  busy: boolean;
  onChange: (change: Partial<MedicalRollForm>) => void;
};

const SIDES: BodySide[] = ['left', 'right'];

/** The procedure of a treatment, the ones the injury does not admit disabled. */
export const ProcedureField: FC<FieldsProps & { injury: Injury }> = ({ form, busy, onChange, injury }) => {
  const { t } = useTranslation();
  return (
    <TextField
      select
      label={t('treatment-procedure')}
      value={form.procedure}
      onChange={(event) => onChange({ procedure: event.target.value as TacticalProcedure })}
      disabled={busy}
      fullWidth
    >
      {TACTICAL_PROCEDURES.map((value) => (
        <MenuItem key={value} value={value} disabled={!isProcedureAvailable(value, injury)}>
          {t(`procedure-${value}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

/** The limb of an amputation, fixed by the injury it comes from. */
export const AmputationFields: FC<FieldsProps & { injury?: Injury; limbLost: boolean }> = ({
  form,
  busy,
  onChange,
  injury,
  limbLost,
}) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          select
          label={t('location')}
          value={form.location}
          onChange={(event) => onChange({ location: event.target.value as LostLimbLocation })}
          disabled={busy || !!injury?.location}
          fullWidth
        >
          {LOST_LIMB_LOCATIONS.map((value) => (
            <MenuItem key={value} value={value}>
              {t(value)}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label={t('limb-side')}
          value={form.side}
          onChange={(event) => onChange({ side: event.target.value as BodySide })}
          disabled={busy || !!injury?.side}
          fullWidth
        >
          {SIDES.map((value) => (
            <MenuItem key={value} value={value}>
              {t(`side-${value}`)}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {limbLost && <Alert severity="warning">{t('err-limb-already-lost')}</Alert>}
      <Typography variant="caption" color="text.secondary">
        {t('amputation-method-emergency-help', {
          difficulty: AMPUTATION_DIFFICULTY.emergency,
          penalty: AMPUTATION_INJURY_PENALTY,
        })}
      </Typography>
    </Stack>
  );
};

/** The method of a revival; a defibrillation adds its difficulty and whether its source is dangerous. */
export const ReviveFields: FC<FieldsProps & { soulRoundsLeft: number }> = ({
  form,
  busy,
  onChange,
  soulRoundsLeft,
}) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <TextField
        select
        label={t('revive-method')}
        value={form.method}
        onChange={(event) => onChange({ method: event.target.value as ReviveMethod })}
        disabled={busy}
        fullWidth
      >
        {REVIVE_METHODS.map((value) => (
          <MenuItem key={value} value={value}>
            {t(`revive-method-${value}`)}
          </MenuItem>
        ))}
      </TextField>
      {form.method === 'defibrillation' && (
        <>
          <NumberPadField
            steps={[-10, -5, 5, 10]}
            label={t('revive-defibrillation-difficulty')}
            value={form.defibrillation}
            onChange={(defibrillation) => onChange({ defibrillation })}
            placeholder={formatBonus(DEFIBRILLATION_DIFFICULTY_RANGE.max)}
            integer
            allowNegatives
            min={DEFIBRILLATION_DIFFICULTY_RANGE.min}
            max={DEFIBRILLATION_DIFFICULTY_RANGE.max}
            disabled={busy}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.dangerousSource}
                onChange={(_, dangerousSource) => onChange({ dangerousSource })}
              />
            }
            label={t('revive-dangerous-source')}
          />
          {form.dangerousSource && (
            <NumberPadField
              label={t('revive-shock-hits-roll')}
              value={form.shockHitsRoll}
              onChange={(shockHitsRoll) => onChange({ shockHitsRoll })}
              integer
              min={0}
              disabled={busy}
            />
          )}
        </>
      )}
      <Typography variant="caption" color="text.secondary">
        {t('revive-help', { rounds: soulRoundsLeft })}
      </Typography>
    </Stack>
  );
};

/** The dice of the extra hits and heat critical of a cauterization. */
export const CauterizeFields: FC<FieldsProps> = ({ form, busy, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      <Typography variant="caption" color="text.secondary">
        {t('cauterize-heat-help')}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <NumberPadField
          label={t('cauterize-heat-hits-roll')}
          value={form.heatHitsRoll}
          onChange={(heatHitsRoll) => onChange({ heatHitsRoll })}
          integer
          min={0}
          disabled={busy}
        />
        <RollField
          spec={D100}
          label={t('cauterize-heat-critical-roll')}
          value={form.heatCriticalRoll}
          onChange={(value) => onChange({ heatCriticalRoll: value.total })}
          onClear={() => onChange({ heatCriticalRoll: null })}
          disabled={busy}
        />
      </Stack>
    </Stack>
  );
};
