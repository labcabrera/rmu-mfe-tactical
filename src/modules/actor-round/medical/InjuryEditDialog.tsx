import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Button, MenuItem, Stack, TextField } from '@mui/material';
import {
  BodyLocation,
  BodySide,
  Injury,
  InjurySeverity,
  InjuryStatus,
  InjuryType,
  NumericInput,
  RmuDialog,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { updateActorRoundInjury } from '../../api/actor-rounds';
import { ActorRound, UpdateActorInjuryDto } from '../../api/actor-rounds.dto';
import { useTacticalNotify } from '../../services/notify-service';

const TYPES: InjuryType[] = [
  'bone',
  'cut-burn',
  'muscle-tendon',
  'organ',
  'poison-disease',
  'skin-tissue',
  'unknown',
];
const SEVERITIES: InjurySeverity[] = ['light', 'medium', 'severe'];
const LOCATIONS: BodyLocation[] = ['head', 'chest', 'abdomen', 'arm', 'leg'];
const SIDES: BodySide[] = ['left', 'right'];
const STATUSES: InjuryStatus[] = ['active', 'recovering', 'permanent', 'healed'];

/** Game master's edit of an injury of the actor: type, severity, location, side, penalty, bleeding, status, notes. */
const InjuryEditDialog: FC<{
  actorRound: ActorRound;
  injury: Injury | null;
  onClose: () => void;
  onSaved: (actorRound: ActorRound) => void;
}> = ({ actorRound, injury, onClose, onSaved }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useTacticalNotify();
  const [form, setForm] = useState<UpdateActorInjuryDto>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!injury) return;
    setForm({
      type: injury.type,
      severity: injury.severity,
      location: injury.location,
      side: injury.side,
      penalty: injury.penalty,
      bleeding: injury.bleeding ?? 0,
      description: injury.description ?? '',
      status: injury.status,
    });
  }, [injury]);

  if (!injury) return null;

  const change = <K extends keyof UpdateActorInjuryDto>(key: K, value: UpdateActorInjuryDto[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const save = () => {
    // The API keeps a missing field: only the ones given are sent.
    const dto = Object.fromEntries(
      Object.entries(form).filter(([, value]) => value !== undefined)
    ) as UpdateActorInjuryDto;
    setBusy(true);
    updateActorRoundInjury(actorRound.id, injury.id, dto, auth)
      .then((updated) => {
        onSaved(updated);
        onClose();
      })
      .catch((err) => notify.error(err))
      .finally(() => setBusy(false));
  };

  return (
    <RmuDialog
      open={!!injury}
      onClose={onClose}
      title={t('edit-injury')}
      subtitle={actorRound.actorName}
      maxWidth="sm"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={save} disabled={busy}>
            {t('save')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FieldSelect label={t('type')} value={form.type} values={TYPES} labelOf={(value) => t(`injury-type-${value}`)} onChange={(value) => change('type', value)} disabled={busy} />
          <FieldSelect label={t('injury-severity')} value={form.severity} values={SEVERITIES} labelOf={(value) => t(`injury-severity-${value}`)} onChange={(value) => change('severity', value)} disabled={busy} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FieldSelect label={t('location')} value={form.location} values={LOCATIONS} labelOf={(value) => t(value)} onChange={(value) => change('location', value)} disabled={busy} />
          <FieldSelect label={t('body-side')} value={form.side} values={SIDES} labelOf={(value) => t(`side-${value}`)} onChange={(value) => change('side', value)} disabled={busy} />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <NumericInput
            label={t('penalty')}
            value={form.penalty ?? null}
            onChange={(value) => change('penalty', value === null ? undefined : Math.min(0, value))}
            integer
            allowNegatives
            max={0}
            disabled={busy}
          />
          <NumericInput
            label={t('bleeding')}
            value={form.bleeding ?? null}
            onChange={(value) => change('bleeding', value === null ? undefined : Math.max(0, value))}
            integer
            min={0}
            disabled={busy}
          />
          <FieldSelect label={t('status')} value={form.status} values={STATUSES} labelOf={(value) => t(`injury-status-${value}`)} onChange={(value) => change('status', value)} disabled={busy} />
        </Stack>
        <TextField
          label={t('description')}
          value={form.description ?? ''}
          onChange={(event) => change('description', event.target.value)}
          disabled={busy}
          multiline
          minRows={2}
          fullWidth
        />
      </Stack>
    </RmuDialog>
  );
};

/** A select of one field of the injury; an empty value leaves it out. */
function FieldSelect<T extends string>({
  label,
  value,
  values,
  labelOf,
  onChange,
  disabled,
}: {
  label: string;
  value: T | undefined;
  values: T[];
  labelOf: (value: T) => string;
  onChange: (value: T | undefined) => void;
  disabled: boolean;
}) {
  return (
    <TextField
      select
      label={label}
      value={value ?? ''}
      onChange={(event) => onChange((event.target.value || undefined) as T | undefined)}
      disabled={disabled}
      fullWidth
    >
      {values.map((option) => (
        <MenuItem key={option} value={option}>
          {labelOf(option)}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default InjuryEditDialog;
