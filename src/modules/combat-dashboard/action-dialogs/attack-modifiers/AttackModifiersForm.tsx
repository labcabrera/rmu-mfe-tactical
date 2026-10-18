import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import {
  Box,
  Chip,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttackModifiers, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import {
  AttackKind,
  ChoiceField,
  declaredValue,
  FlagField,
  ModifierField,
  ModifierFieldGroup,
  fieldsFor,
  isDeclared,
  NumberField,
} from './attack-modifier-fields';

const GROUPS: ModifierFieldGroup[] = ['offense', 'defense', 'situation'];
// Choices with up to this many options are inline buttons; longer ones are a select.
const MAX_INLINE_OPTIONS = 4;

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** Flags pre-filled from the target's effects (the attacker can still change them). */
const fromTargetEffects = (target: ActorRound | undefined): Partial<Record<keyof ActionAttackModifiers, boolean>> => {
  const statuses = new Set(target?.effects?.map((effect) => effect.status) ?? []);
  return { stunnedFoe: statuses.has('stunned'), surprisedFoe: statuses.has('surprised'), proneTarget: statuses.has('prone') };
};

/**
 * Modifiers of one attack, for melee and ranged: grouped by attacker, target and situation, with inline controls
 * and a summary of what is declared. Target fields are shared by every attack against the same target.
 */
const AttackModifiersForm: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
  kind: AttackKind;
  target: ActorRound | undefined;
  /** Extra controls of the situation group, e.g. the range of a ranged attack. */
  situationExtra?: ReactNode;
}> = ({ formData, setFormData, index, kind, target, situationExtra }) => {
  const { t } = useTranslation();
  const modifiers = formData.attacks?.[index]?.modifiers;
  if (!modifiers) return null;

  const auto = fromTargetEffects(target);
  const fields = fieldsFor(kind);

  const change = (field: ModifierField, value: unknown) => {
    setFormData((prev) => {
      const targetId = prev.attacks[index]?.modifiers.targetId;
      const shared = field.group === 'defense' && !!targetId;
      const attacks = prev.attacks.map((attack, i) => {
        const applies = i === index || (shared && attack.modifiers.targetId === targetId);
        if (!applies) return attack;
        const next = { ...attack.modifiers, [field.name]: value };
        // A called shot starts with the usual penalty; going back to none clears it.
        if (field.name === 'calledShot') next.calledShotPenalty = value === 'none' ? 0 : (attack.modifiers.calledShotPenalty ?? -25) || -25;
        return { ...attack, modifiers: next };
      });
      return { ...prev, attacks };
    });
  };

  const declared = fields.filter((field) => field.kind !== 'number' || field.name === 'customBonus').filter((field) => isDeclared(field, modifiers));
  const declaredSum = declared.reduce((sum, field) => sum + (declaredValue(field, modifiers, kind) ?? 0), 0);

  const optionLabel = (key: string, value: number | null) => (value ? `${t(key)} ${signed(value)}` : t(key));

  const renderFlag = (field: FlagField) => {
    const on = modifiers[field.name] === true;
    const bonus = field.bonus(kind);
    const isAuto = on && auto[field.name];
    const chip = (
      <Chip
        key={field.name}
        label={bonus ? `${t(field.label)} ${signed(bonus)}` : t(field.label)}
        color={on ? 'primary' : 'default'}
        variant={on ? 'filled' : 'outlined'}
        icon={isAuto ? <AutoAwesomeIcon /> : undefined}
        aria-pressed={on}
        onClick={() => change(field, !on)}
      />
    );
    return isAuto ? (
      <Tooltip key={field.name} title={t('from-target-effect')}>
        {chip}
      </Tooltip>
    ) : (
      chip
    );
  };

  const renderChoice = (field: ChoiceField) => {
    const options = field.options(kind);
    const value = (modifiers[field.name] as string | null | undefined) || field.defaultValue;
    if (options.length <= MAX_INLINE_OPTIONS) {
      return (
        <Stack spacing={0.5}>
          <Typography variant="caption" color="text.secondary">
            {t(field.label)}
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            fullWidth
            value={value}
            aria-label={t(field.label)}
            onChange={(_, next: string | null) => next && change(field, next)}
          >
            {options.map((option) => (
              <ToggleButton key={option.key} value={option.key} sx={{ textTransform: 'none', px: 0.5 }}>
                {optionLabel(option.key, option.value)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      );
    }
    return (
      <TextField select fullWidth size="small" label={t(field.label)} value={value} onChange={(e) => change(field, e.target.value)}>
        {options.map((option) => (
          <MenuItem key={option.key} value={option.key}>
            {optionLabel(option.key, option.value)}
          </MenuItem>
        ))}
      </TextField>
    );
  };

  const renderNumber = (field: NumberField) =>
    field.visible && !field.visible(modifiers) ? null : (
      <NumericInput
        label={t(field.label)}
        value={(modifiers[field.name] as number | null) || null}
        integer
        onChange={(value) => change(field, value)}
      />
    );

  return (
    <Stack spacing={2}>
      <Box>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
          <Typography variant="subtitle2">{t('declared-modifiers')}</Typography>
          {declared.length > 0 && (
            <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {signed(declaredSum)}
            </Typography>
          )}
        </Stack>
        {declared.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('no-declared-modifiers')}
          </Typography>
        ) : (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
            {declared.map((field) => {
              const value = declaredValue(field, modifiers, kind);
              const shown = field.kind === 'choice' ? `${t(field.label)}: ${t(String(modifiers[field.name]))}` : t(field.label);
              return <Chip key={field.name} size="small" variant="outlined" label={value ? `${shown} ${signed(value)}` : shown} />;
            })}
          </Stack>
        )}
      </Box>
      {GROUPS.map((group) => {
        const groupFields = fields.filter((field) => field.group === group);
        const flags = groupFields.filter((field): field is FlagField => field.kind === 'flag');
        const others = groupFields.filter((field) => field.kind !== 'flag');
        return (
          <Box key={group} component="section" aria-label={t(`modifier-group-${group}`)}>
            <Typography variant="overline" color="text.secondary">
              {t(`modifier-group-${group}`)}
            </Typography>
            {flags.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: others.length ? 1.5 : 0 }}>
                {flags.map(renderFlag)}
              </Stack>
            )}
            <Grid container spacing={1.5}>
              {others.map((field) => (
                <Grid key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
                  {field.kind === 'choice' ? renderChoice(field) : renderNumber(field as NumberField)}
                </Grid>
              ))}
              {group === 'situation' && situationExtra && <Grid size={{ xs: 12, sm: 6, md: 4 }}>{situationExtra}</Grid>}
            </Grid>
          </Box>
        );
      })}
    </Stack>
  );
};

export default AttackModifiersForm;
