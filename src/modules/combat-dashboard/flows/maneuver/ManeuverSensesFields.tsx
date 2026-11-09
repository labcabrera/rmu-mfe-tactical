import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import {
  ChipRow,
  formatBonus,
  ManeuverSenses,
  NumberPadField,
  Sense,
  SenseSelection,
  SenseUsage,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { ManeuverModifiersListing } from '../../../api/action.dto';
import { activeSenseModifiers, ManeuverForm } from './maneuver-form';

const Caption: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
    {children}
  </Typography>
);

/**
 * The sense of a Perception or Tracking maneuver (workspace spec 076, block C): the sense used and whether the
 * maneuver requires it or the sense only helps, the situations the sense talents of the actor need (a sound to locate,
 * a warm target, a hidden one, within the range of Darkvision), the values the game master may change (Missing Sense
 * where it helps, Heatsense) and the sense modifiers that apply. Light only counts with vision.
 */
const ManeuverSensesFields: FC<{
  senses: ManeuverSenses;
  listing: ManeuverModifiersListing;
  form: ManeuverForm;
  onChange: (change: Partial<ManeuverForm>) => void;
}> = ({ senses, listing, form, onChange }) => {
  const { t } = useTranslation();
  const active = activeSenseModifiers(listing, form);
  const toggleSelection = (selection: SenseSelection) =>
    onChange({
      senseSelections: form.senseSelections.includes(selection)
        ? form.senseSelections.filter((each) => each !== selection)
        : [...form.senseSelections, selection],
    });
  const missingHelpful = active.find(
    (modifier) => modifier.key.startsWith('missing-sense-') && modifier.usage === 'helpful'
  );
  const heatsense = active.find((modifier) => modifier.key === 'heatsense');

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box>
          <Caption>{t('sense')}</Caption>
          <ToggleButtonGroup
            color="primary"
            size="small"
            exclusive
            value={form.sense}
            onChange={(_, value: Sense | null) => value && onChange({ sense: value })}
            sx={{ flexWrap: 'wrap' }}
          >
            {senses.options.map((sense) => (
              <ToggleButton key={sense} value={sense}>
                {t(`sense-${sense}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
        <Box>
          <Caption>{t('sense-usage')}</Caption>
          <ToggleButtonGroup
            color="primary"
            size="small"
            exclusive
            value={form.senseUsage}
            onChange={(_, value: SenseUsage | null) => value && onChange({ senseUsage: value })}
          >
            {senses.usages.map((usage) => (
              <ToggleButton key={usage} value={usage}>
                {t(`sense-usage-${usage}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Stack>
      {senses.selections.length > 0 && (
        <Box>
          <Caption>{t('sense-selections')}</Caption>
          <ChipRow>
            {senses.selections.map((selection) => {
              const selected = form.senseSelections.includes(selection);
              return (
                <Chip
                  key={selection}
                  label={t(`sense-selection-${selection}`)}
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  aria-pressed={selected}
                  onClick={() => toggleSelection(selection)}
                />
              );
            })}
          </ChipRow>
        </Box>
      )}
      {(missingHelpful || heatsense) && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
          {missingHelpful && (
            <Box sx={{ width: 200 }}>
              <NumberPadField
                label={t(missingHelpful.key)}
                value={form.missingSenseModifier ?? missingHelpful.value}
                onChange={(missingSenseModifier) => onChange({ missingSenseModifier })}
                min={missingHelpful.min}
                max={missingHelpful.max}
                allowNegatives
                integer
              />
            </Box>
          )}
          {heatsense && (
            <Box sx={{ width: 200 }}>
              <NumberPadField
                label={t('heatsense')}
                value={form.heatsenseModifier ?? heatsense.value}
                onChange={(heatsenseModifier) => onChange({ heatsenseModifier })}
                min={heatsense.min}
                max={heatsense.max}
                integer
              />
            </Box>
          )}
        </Stack>
      )}
      {active.length > 0 && (
        <ChipRow>
          {active.map((modifier) => (
            <Chip
              key={`${modifier.key}-${modifier.usage ?? ''}`}
              size="small"
              variant="outlined"
              color={modifier.value < 0 ? 'error' : modifier.value > 0 ? 'success' : 'default'}
              label={`${t(modifier.key)} ${formatBonus(modifier.value)}`}
            />
          ))}
        </ChipRow>
      )}
    </Stack>
  );
};

export default ManeuverSensesFields;
