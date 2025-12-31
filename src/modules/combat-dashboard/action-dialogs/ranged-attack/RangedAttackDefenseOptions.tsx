import React, { Dispatch, FC, SetStateAction } from 'react';
import { FormControl, FormLabel, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';

const RangedAttackDefenseOptions: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const labelId = 'ranged-attack-modifiers-selector-label';

  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;

  const minWidth = 140;

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
            {t('Defensive options')}
          </FormLabel>
          <ToggleButtonGroup
            value={[!disabledDB ? 'DB' : null, !disabledShield ? 'Shield' : null].filter(Boolean)}
            onChange={(_e, newValues: string[]) => {
              const hasDB = newValues.includes('DB');
              const hasShield = newValues.includes('Shield');
              const newAttacks = formData.attacks.map((a, i) =>
                i === index
                  ? { ...a, modifiers: { ...a.modifiers, disabledDB: !hasDB, disabledShield: !hasShield } }
                  : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
            aria-label="defensive-options"
          >
            <ToggleButton value="DB" sx={{ minWidth }}>
              {t('DB')}
            </ToggleButton>
            <ToggleButton value="Shield" sx={{ minWidth }}>
              {t('Shield')}
            </ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Grid>
    </Grid>
  );
};

export default RangedAttackDefenseOptions;
