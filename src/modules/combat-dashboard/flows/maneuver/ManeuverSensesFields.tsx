import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack } from '@mui/material';
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
import OptionChips, { ToggleChips } from './OptionChips';
import { activeSenseModifiers, ManeuverForm } from './maneuver-form';

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
        <OptionChips
          label={t('sense')}
          options={senses.options.map((key) => ({ key, value: null }))}
          value={form.sense ?? ''}
          onChange={(key) => onChange({ sense: key as Sense })}
          optionLabel={(option) => t(`sense-${option.key}`)}
        />
        <OptionChips
          label={t('sense-usage')}
          options={senses.usages.map((key) => ({ key, value: null }))}
          value={form.senseUsage ?? ''}
          onChange={(key) => onChange({ senseUsage: key as SenseUsage })}
          optionLabel={(option) => t(`sense-usage-${option.key}`)}
        />
      </Stack>
      {senses.selections.length > 0 && (
        <ToggleChips
          label={t('sense-selections')}
          options={senses.selections.map((selection) => ({
            key: selection,
            label: t(`sense-selection-${selection}`),
          }))}
          selected={form.senseSelections}
          onToggle={(key) => toggleSelection(key as SenseSelection)}
        />
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
