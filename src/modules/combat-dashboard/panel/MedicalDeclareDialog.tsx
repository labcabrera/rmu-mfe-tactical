import React, { FC, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  CharacterPicker,
  formatBonus,
  Injury,
  NumberPadField,
  RmuDialog,
  SectionLabel,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import {
  medicalDurationRounds,
  medicalProcedureProblem,
  previewTreatmentDifficulty,
} from '../../actor-round/medical/medical';
import { useCharacterHerbs } from '../../actor-round/poison/combat-herbs';
import {
  CastSupport,
  DIFFICULTY_TABLE,
  MEDICAL_ACTION_PROCEDURES,
  MEDICAL_AP_PER_ROUND,
  MedicalDeclarationDto,
  MedicalProcedure,
} from '../../api/action.dto';
import { ActorRound, ActorRoundEffect } from '../../api/actor-rounds.dto';
import { useActorRoundOption } from '../../services/actor-round-option';
import { actorRoundDownState } from '../../services/actor-round-service';
import { useHealingTables } from '../../services/core-tables';

const CAST_SUPPORTS: CastSupport[] = ['none', 'cane', 'crutches'];
const INJURY_PROCEDURES = MEDICAL_ACTION_PROCEDURES.filter((procedure) => procedure !== 'stabilize');
const DYING_PROCEDURES: MedicalProcedure[] = ['stabilize'];
const DEFAULT_SALVE_RANGE = { min: -25, max: 25 };

/** What the action treats: an injury of the patient, or its dying effect (stabilize). */
type MedicalTarget = { kind: 'injury'; injury: Injury } | { kind: 'dying'; effect: ActorRoundEffect };

const targetKey = (target: MedicalTarget) =>
  target.kind === 'injury' ? `injury:${target.injury.id}` : `dying:${target.effect.id}`;

/** Injuries still to treat and dying effects of an actor, the ones that bleed first. */
const targetsOf = (actorRound: ActorRound | undefined): MedicalTarget[] => {
  if (!actorRound) return [];
  const dying = (actorRound.effects ?? [])
    .filter((effect) => effect.status === 'dying')
    .map((effect): MedicalTarget => ({ kind: 'dying', effect }));
  const injuries = (actorRound.injuries ?? [])
    .filter((injury) => injury.status !== 'healed' && !injury.poison)
    .sort((a, b) => (b.bleeding ?? 0) - (a.bleeding ?? 0))
    .map((injury): MedicalTarget => ({ kind: 'injury', injury }));
  return [...dying, ...injuries];
};

/** The procedure a target starts with: stabilize a dying actor, press a bleeding wound, dress any other one. */
const defaultProcedure = (target: MedicalTarget | undefined): MedicalProcedure =>
  target?.kind === 'dying' ? 'stabilize' : (target?.injury.bleeding ?? 0) > 0 ? 'pressure' : 'dress';

/**
 * Declaration of a `medical` action (workspace spec 068, decisions 1 to 7): the healer (the actor) treats a patient of
 * the game, itself included. It picks an injury or a dying effect, the procedure (the ones that do not apply are
 * disabled with the reason), the rounds (core's duration unless the game master sets them), an optional difficulty
 * (previewed when core's tables are readable), a herb that helps (Herbalism, +25 on a success), the support of a leg
 * cast and the modifier of a salve. The Medicine roll is made when the action is resolved.
 */
const MedicalDeclareDialog: FC<{
  open: boolean;
  actorRound: ActorRound | null;
  busy: boolean;
  onClose: () => void;
  onDeclare: (medical: MedicalDeclarationDto) => void;
}> = ({ open, actorRound, busy, onClose, onDeclare }) => {
  const { t } = useTranslation();
  const { actorRounds } = useContext(CombatContext)!;
  const toOption = useActorRoundOption();
  const tables = useHealingTables();
  const herbs = useCharacterHerbs(actorRound, open);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [procedure, setProcedure] = useState<MedicalProcedure>('pressure');
  const [rounds, setRounds] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string>('');
  const [herbalism, setHerbalism] = useState(false);
  const [herbId, setHerbId] = useState('');
  const [castSupport, setCastSupport] = useState<CastSupport>('none');
  const [salveModifier, setSalveModifier] = useState<number | null>(null);

  // Patients: every actor not dead, the healer included; the wounded first.
  const patients = useMemo(
    () =>
      (actorRounds ?? [])
        .filter((each) => actorRoundDownState(each) !== 'dead' || each.actorId === actorRound?.actorId)
        .sort((a, b) => targetsOf(b).length - targetsOf(a).length),
    [actorRounds, actorRound]
  );
  const patient = patients.find((each) => each.actorId === patientId);
  const targets = targetsOf(patient);
  const target = targets.find((each) => targetKey(each) === selectedKey);
  const injury = target?.kind === 'injury' ? target.injury : undefined;

  const selectTarget = (next: MedicalTarget | undefined) => {
    setSelectedKey(next ? targetKey(next) : '');
    setProcedure(defaultProcedure(next));
    setRounds(null);
    setDifficulty('');
  };

  useEffect(() => {
    if (!open || !actorRound) return;
    // The first wounded actor of the healer's faction, else the healer.
    const first =
      patients.find((each) => each.factionId === actorRound.factionId && targetsOf(each).length > 0) ??
      patients.find((each) => each.actorId === actorRound.actorId);
    setPatientId(first?.actorId ?? null);
    selectTarget(targetsOf(first)[0]);
    setHerbalism(false);
    setHerbId('');
    setCastSupport('none');
    setSalveModifier(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, actorRound?.id]);

  if (!actorRound) return null;

  const procedureProblem = (value: MedicalProcedure): string | undefined => {
    if (!target) return undefined;
    if (target.kind === 'dying') return value === 'stabilize' ? undefined : 'err-effect-not-dying';
    if (value === 'stabilize') return 'err-effect-not-dying';
    return medicalProcedureProblem(value, target.injury, tables);
  };
  const problem = target ? procedureProblem(procedure) : undefined;
  const coreRounds = medicalDurationRounds(procedure, injury, tables);
  const preview =
    target?.kind === 'injury' && procedure !== 'stabilize'
      ? previewTreatmentDifficulty(procedure, target.injury, tables)
      : undefined;
  const salveRange = tables?.salveModifier ?? DEFAULT_SALVE_RANGE;
  const legCast = procedure === 'cast' && (!injury?.location || injury.location === 'leg');
  const salveInvalid =
    procedure === 'salve' &&
    salveModifier !== null &&
    (salveModifier < salveRange.min || salveModifier > salveRange.max);
  const valid = !!patient && !!target && !problem && coreRounds !== null && !salveInvalid && (rounds ?? 1) >= 1;

  const declare = () => {
    if (!patient || !target) return;
    onDeclare({
      patientActorId: patient.actorId,
      injuryId: target.kind === 'injury' ? target.injury.id : null,
      effectId: target.kind === 'dying' ? target.effect.id : null,
      procedure,
      ...(rounds !== null ? { rounds } : {}),
      ...(difficulty ? { difficulty } : {}),
      ...(herbalism ? { herbalism: { roll: null, itemId: herbId || null } } : {}),
      ...(legCast ? { castSupport } : {}),
      ...(procedure === 'salve' && salveModifier !== null ? { salveModifier } : {}),
    });
  };

  const targetLabel = (each: MedicalTarget) => {
    if (each.kind === 'dying')
      return [
        t('dying'),
        t('rounds-short', { count: each.effect.rounds ?? 0 }),
        each.effect.causeTreated && t('dying-cause-treated'),
      ]
        .filter(Boolean)
        .join(' · ');
    const wound = each.injury;
    return [
      t(`injury-type-${wound.type ?? 'unknown'}`),
      t(`injury-severity-${wound.severity}`),
      wound.location ? t(wound.location) : null,
      (wound.bleeding ?? 0) > 0 ? t('injury-bleeding-per-round', { value: wound.bleeding }) : null,
    ]
      .filter(Boolean)
      .join(' · ');
  };
  const targetProblem = (each: MedicalTarget) =>
    each.kind === 'injury' && each.injury.treatmentInProgress ? 'err-treatment-in-progress' : undefined;

  const roundsHelp =
    coreRounds === null
      ? t('err-treatment-not-in-combat')
      : coreRounds === undefined
        ? t('medical-rounds-from-core')
        : t('medical-rounds-core', { count: coreRounds, ap: coreRounds * MEDICAL_AP_PER_ROUND });

  return (
    <RmuDialog
      open={open}
      onDismiss={onClose}
      title={t('medical-action')}
      subtitle={t('medical-healer', { healer: actorRound.actorName })}
      maxWidth="sm"
      buttons={
        <>
          <Button onClick={onClose} disabled={busy}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={declare} disabled={!valid || busy}>
            {t('declare')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <SectionLabel>{t('patient')}</SectionLabel>
        <CharacterPicker
          variant="compact"
          label={t('patient')}
          options={patients.map((each) =>
            toOption(each, each.actorId === actorRound.actorId ? { name: `${each.actorName} (${t('self')})` } : {})
          )}
          groupByFaction
          value={patientId}
          onChange={(id) => {
            setPatientId(id);
            selectTarget(targetsOf(patients.find((each) => each.actorId === id))[0]);
          }}
          disabled={busy}
        />
        {patient && targets.length === 0 ? (
          <Alert severity="info">{t('medical-no-targets')}</Alert>
        ) : (
          <TextField
            select
            label={t('medical-target')}
            value={selectedKey}
            onChange={(event) => selectTarget(targets.find((each) => targetKey(each) === event.target.value))}
            disabled={busy || !patient}
            fullWidth
          >
            {targets.map((each) => {
              const reason = targetProblem(each);
              return (
                <MenuItem key={targetKey(each)} value={targetKey(each)} disabled={!!reason}>
                  <ListItemText primary={targetLabel(each)} secondary={reason ? t(reason) : undefined} />
                </MenuItem>
              );
            })}
          </TextField>
        )}

        {target && (
          <TextField
            select
            label={t('treatment-procedure')}
            value={procedure}
            onChange={(event) => {
              setProcedure(event.target.value as MedicalProcedure);
              setRounds(null);
            }}
            disabled={busy}
            fullWidth
          >
            {(target.kind === 'dying' ? DYING_PROCEDURES : INJURY_PROCEDURES).map((value) => {
              const reason = procedureProblem(value);
              return (
                <MenuItem key={value} value={value} disabled={!!reason}>
                  <ListItemText primary={t(`procedure-${value}`)} secondary={reason ? t(reason) : undefined} />
                </MenuItem>
              );
            })}
          </TextField>
        )}
        {problem && <Alert severity="warning">{t(problem)}</Alert>}

        {target && (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <NumberPadField
              label={t('rounds')}
              value={rounds}
              onChange={setRounds}
              placeholder={typeof coreRounds === 'number' ? String(coreRounds) : undefined}
              integer
              min={1}
              disabled={busy}
            />
            <TextField
              select
              label={t('difficulty')}
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              disabled={busy}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">
                {preview?.kind === 'value' && tables
                  ? t('medical-difficulty-default-value', { value: formatBonus(preview.value) })
                  : t('medical-difficulty-default')}
              </MenuItem>
              {DIFFICULTY_TABLE.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {`${t(`difficulty-${option.key}`)} ${formatBonus(option.value)}`}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        )}
        {target && (
          <Typography variant="caption" color="text.secondary">
            {[
              roundsHelp,
              procedure === 'stabilize' ? t('medical-stabilize-help') : t('medical-roll-help'),
              rounds !== null ? t('medical-rounds-override') : null,
            ]
              .filter(Boolean)
              .join(' ')}
          </Typography>
        )}

        {legCast && (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              {t('cast-support')}
            </Typography>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={castSupport}
              onChange={(_, value: CastSupport | null) => value && setCastSupport(value)}
              aria-label={t('cast-support')}
            >
              {CAST_SUPPORTS.map((value) => (
                <ToggleButton key={value} value={value}>
                  {t(`cast-support-${value}`)}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Stack>
        )}
        {procedure === 'salve' && (
          <Box sx={{ maxWidth: 260 }}>
            <NumberPadField
              steps={[-10, -5, 5, 10]}
              label={t('salve-modifier')}
              value={salveModifier}
              onChange={setSalveModifier}
              integer
              allowNegatives
              error={salveInvalid}
              helperText={t('medical-salve-range', {
                min: formatBonus(salveRange.min),
                max: formatBonus(salveRange.max),
              })}
              disabled={busy}
            />
          </Box>
        )}

        {target && procedure !== 'stabilize' && (
          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={herbalism}
                  onChange={(event) => setHerbalism(event.target.checked)}
                  disabled={busy}
                />
              }
              label={t('medical-herbalism')}
            />
            {herbalism && herbs.length > 0 && (
              <TextField
                select
                size="small"
                label={t('medical-herbalism-item')}
                value={herbId}
                onChange={(event) => setHerbId(event.target.value)}
                disabled={busy}
              >
                <MenuItem value="">{t('medical-herbalism-no-item')}</MenuItem>
                {herbs.map((herb) => (
                  <MenuItem key={herb.id} value={herb.id}>
                    {`${t(herb.name, herb.name)} (${herb.amount})`}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {herbalism && (
              <Typography variant="caption" color="text.secondary">
                {t('medical-herbalism-help')}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default MedicalDeclareDialog;
