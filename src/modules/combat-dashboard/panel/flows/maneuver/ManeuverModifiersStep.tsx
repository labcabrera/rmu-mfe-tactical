import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { formatBonus, ManeuverType, NumericInput, OPEN_D100, RollField } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ManeuverModifiersListing, ManeuverSkillModifier } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';
import ModifierTile from '../../../action-dialogs/attack-modifiers/pickers/ModifierTile';
import OptionTiles from '../../../action-dialogs/attack-modifiers/pickers/OptionTiles';
import DifficultyPicker from '../DifficultyPicker';
import { isConflicting, ManeuverForm, optionLabelKey, predictedTotal, selectionValue } from './maneuver-form';

const MANEUVER_TYPES: ManeuverType[] = ['absolute', 'percent'];

const Caption: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
    {children}
  </Typography>
);

/**
 * Modifiers step of a maneuver, drawn from the API's listing (spec 010 §6): the type, the base modifiers the API
 * applies by itself (read-only), the difficulty, the light when the skill uses it, the skill's catalog modifiers,
 * the passive side of a conflicting maneuver (a target actor of the game with its roll, spec 022 decision 12, or
 * its total by hand), a custom bonus and the predicted total before the roll.
 */
const ManeuverModifiersStep: FC<{
  listing: ManeuverModifiersListing;
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
  /** Actors the maneuver can be against: the others of the round. */
  targets?: ActorRound[];
}> = ({ listing, form, onChange, targets = [] }) => {
  const { t } = useTranslation();
  const label = (key: string) => t(key, { defaultValue: key });
  const select = (key: string, value: ManeuverForm['selections'][string] | null) => {
    const selections = { ...form.selections };
    if (value === null || value === false) delete selections[key];
    else selections[key] = value;
    onChange({ selections });
  };
  const conflicting = isConflicting(listing, form.maneuverType);
  const target = targets.find((each) => each.actorId === form.targetActorId);
  const total = predictedTotal(listing, form);
  const progress = listing.progress ?? 0;

  const skillModifier = (modifier: ManeuverSkillModifier) => {
    const selection = form.selections[modifier.key];
    const tooltip = modifier.description ?? '';
    switch (modifier.type) {
      case 'flag':
        return (
          <Tooltip key={modifier.key} title={tooltip}>
            <Box sx={{ maxWidth: 320 }}>
              <ModifierTile
                label={label(modifier.key)}
                value={modifier.value}
                selected={selection === true}
                onClick={() => select(modifier.key, selection !== true)}
              />
            </Box>
          </Tooltip>
        );
      case 'choice':
        return (
          <OptionTiles
            key={modifier.key}
            label={label(modifier.key)}
            options={modifier.options ?? []}
            value={typeof selection === 'string' ? selection : ''}
            // Choosing the selected option again clears it.
            onChange={(key) => select(modifier.key, key === selection ? null : key)}
            optionLabel={(option) => t(optionLabelKey(modifier.key, option.key), { defaultValue: option.key })}
            minTileWidth={150}
          />
        );
      case 'number': {
        const value = selectionValue(modifier, selection);
        return (
          <Stack key={modifier.key} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box sx={{ width: 200 }}>
              <NumericInput
                label={label(modifier.key)}
                value={typeof selection === 'number' ? selection : null}
                onChange={(units) => select(modifier.key, units)}
                min={modifier.min}
                max={modifier.max}
                allowNegatives={modifier.min === undefined || modifier.min < 0}
                integer
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {t('units-times-per-unit', {
                units: typeof selection === 'number' ? selection : 0,
                perUnit: formatBonus(modifier.perUnit ?? 1),
                value: formatBonus(value),
              })}
            </Typography>
          </Stack>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Caption>{t('maneuver-type')}</Caption>
        <ToggleButtonGroup
          color="primary"
          size="small"
          exclusive
          value={form.maneuverType}
          onChange={(_, value: ManeuverType | null) => value && onChange({ maneuverType: value })}
        >
          {MANEUVER_TYPES.map((type) => (
            <ToggleButton key={type} value={type} sx={{ minWidth: 100 }}>
              {t(type)}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        {form.maneuverType === 'percent' && progress > 0 && (
          <Box sx={{ mt: 1, maxWidth: 320 }}>
            <Typography variant="caption" color="text.secondary">
              {t('maneuver-progress', { value: progress })}
            </Typography>
            <LinearProgress variant="determinate" value={Math.min(100, progress)} />
          </Box>
        )}
      </Box>

      <Box>
        <Caption>{t('base-modifiers')}</Caption>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          <Chip
            size="small"
            variant="outlined"
            label={`${label(listing.skill.skillId)} ${formatBonus(listing.skill.bonus)}`}
          />
          {listing.skill.unskilled && <Chip size="small" color="warning" variant="outlined" label={t('unskilled')} />}
          {listing.base.map((modifier) => (
            <Tooltip
              key={modifier.key}
              title={t(`modifier-source-${modifier.source}`, { defaultValue: modifier.source })}
            >
              <Chip
                size="small"
                variant="outlined"
                color={modifier.value < 0 ? 'error' : modifier.value > 0 ? 'success' : 'default'}
                label={`${label(modifier.key)} ${formatBonus(modifier.value)}`}
              />
            </Tooltip>
          ))}
          {listing.base.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {t('no-base-modifiers')}
            </Typography>
          )}
        </Stack>
      </Box>

      <DifficultyPicker
        value={form.difficulty}
        options={listing.difficulty.options}
        onChange={(difficulty) => onChange({ difficulty })}
      />

      {listing.light && (
        <OptionTiles
          label={`${t('lighting')} · ${t(`light-usage-${listing.light.usage}`)}`}
          options={listing.light.options}
          value={form.light ?? ''}
          onChange={(key) => onChange({ light: key === form.light ? null : key })}
          minTileWidth={110}
        />
      )}

      {listing.skillModifiers.length > 0 && (
        <Box>
          <Caption>{t('skill-modifiers')}</Caption>
          <Stack spacing={1.5}>{listing.skillModifiers.map(skillModifier)}</Stack>
        </Box>
      )}

      {conflicting && targets.length > 0 && (
        <Box>
          <Caption>{t('maneuver-target-help')}</Caption>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              select
              size="small"
              label={t('maneuver-target')}
              value={form.targetActorId ?? ''}
              onChange={(event) =>
                onChange({ targetActorId: event.target.value || null, passiveRoll: null, passiveBonus: null })
              }
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">{t('none')}</MenuItem>
              {targets.map((target) => (
                <MenuItem key={target.actorId} value={target.actorId}>
                  {target.actorName}
                </MenuItem>
              ))}
            </TextField>
            {target && (
              <Box sx={{ width: 200 }}>
                <RollField
                  spec={OPEN_D100}
                  label={t('passive-roll')}
                  value={form.passiveRoll}
                  onChange={(passiveRoll) => onChange({ passiveRoll: passiveRoll.total })}
                  onClear={() => onChange({ passiveRoll: null })}
                />
              </Box>
            )}
            {target && target.actorType !== 'character' && (
              <Box sx={{ width: 200 }}>
                <NumericInput
                  label={t('passive-bonus')}
                  value={form.passiveBonus}
                  onChange={(passiveBonus) => onChange({ passiveBonus })}
                  integer
                  allowNegatives
                />
              </Box>
            )}
          </Stack>
          {target && (
            <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
              {t(listing.maneuverType === 'percent' ? 'maneuver-target-trading' : 'maneuver-target-awareness')}
            </Typography>
          )}
        </Box>
      )}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
        {conflicting && !target && (
          <Tooltip title={t('passive-total-help')}>
            <Box sx={{ width: 200 }}>
              <NumericInput
                label={t('passive-total')}
                value={form.passiveTotal}
                onChange={(passiveTotal) => onChange({ passiveTotal })}
                integer
              />
            </Box>
          </Tooltip>
        )}
        <Box sx={{ width: 200 }}>
          <NumericInput
            label={t('custom-bonus')}
            value={form.customBonus}
            onChange={(customBonus) => onChange({ customBonus })}
            integer
          />
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typography variant="body2" color="text.secondary">
          {t('predicted-total')}
        </Typography>
        <Typography variant="h6" component="div" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {t('roll-plus', { value: formatBonus(total) })}
        </Typography>
      </Stack>
    </Stack>
  );
};

export default ManeuverModifiersStep;
