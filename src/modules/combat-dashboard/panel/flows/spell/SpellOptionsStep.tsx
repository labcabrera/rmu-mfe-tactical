import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Box, FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';
import { NumericInput } from '@labcabrera-rmu/rmu-react-shared-lib';
import { SPELL_ARMORS, SPELL_HANDS, SPELL_HELMETS, SPELL_VOICES, SpellOptions } from '../../../../api/action.dto';

/** Maximum preparation rounds that add to the SCR (Spell Law 4.2). */
const MAX_PREPARATION_ROUNDS = 2;

const OptionSelect: FC<{
  label: string;
  value: string;
  values: readonly string[];
  prefix: string;
  onChange: (value: string) => void;
}> = ({ label, value, values, prefix, onChange }) => {
  const { t } = useTranslation();
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} sx={{ minWidth: 150 }}>
      {values.map((each) => (
        <MenuItem key={each} value={each}>
          {t(`${prefix}-${each}`)}
        </MenuItem>
      ))}
    </TextField>
  );
};

/**
 * Choices of a cast that change the Spellcasting Roll (Spell Law Table 4-2): subtlety, hands, voice, helmet and armor
 * (entered by hand for now), preparation rounds and the game master's bonus.
 */
const SpellOptionsStep: FC<{
  options: SpellOptions;
  needsPreparation: boolean;
  onChange: (patch: Partial<SpellOptions>) => void;
}> = ({ options, needsPreparation, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={2}>
      <FormControlLabel
        control={<Switch checked={options.subtle} onChange={(e) => onChange({ subtle: e.target.checked })} />}
        label={t('spell-subtle')}
      />
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
        <OptionSelect
          label={t('spell-hands')}
          value={options.hands}
          values={SPELL_HANDS}
          prefix="spell-hands"
          onChange={(hands) => onChange({ hands: hands as SpellOptions['hands'] })}
        />
        <OptionSelect
          label={t('spell-voice')}
          value={options.voice}
          values={SPELL_VOICES}
          prefix="spell-voice"
          onChange={(voice) => onChange({ voice: voice as SpellOptions['voice'] })}
        />
        <OptionSelect
          label={t('spell-helmet')}
          value={options.helmet}
          values={SPELL_HELMETS}
          prefix="spell-helmet"
          onChange={(helmet) => onChange({ helmet: helmet as SpellOptions['helmet'] })}
        />
        <OptionSelect
          label={t('spell-armor')}
          value={options.armor}
          values={SPELL_ARMORS}
          prefix="spell-armor"
          onChange={(armor) => onChange({ armor: armor as SpellOptions['armor'] })}
        />
      </Stack>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2 }}>
        {options.armor !== 'none' && (
          <Box sx={{ width: 200 }}>
            <NumericInput
              label={t('spell-armor-encumbrance')}
              value={options.armorEncumbrance}
              onChange={(value) => onChange({ armorEncumbrance: value ?? 0 })}
              integer
              allowNegatives={false}
              min={0}
            />
          </Box>
        )}
        <Box sx={{ width: 200 }}>
          <NumericInput
            label={t('spell-preparation-rounds')}
            value={options.preparationRounds}
            onChange={(value) => onChange({ preparationRounds: Math.min(MAX_PREPARATION_ROUNDS, value ?? 0) })}
            integer
            allowNegatives={false}
            min={0}
            max={MAX_PREPARATION_ROUNDS}
          />
        </Box>
        <Box sx={{ width: 200 }}>
          <NumericInput
            label={t('custom-bonus')}
            value={options.customBonus}
            onChange={(value) => onChange({ customBonus: value ?? 0 })}
            integer
          />
        </Box>
      </Stack>
      {needsPreparation && options.preparationRounds < 1 && (
        <Alert severity="warning">{t('err-overcast-needs-preparation')}</Alert>
      )}
    </Stack>
  );
};

export default SpellOptionsStep;
