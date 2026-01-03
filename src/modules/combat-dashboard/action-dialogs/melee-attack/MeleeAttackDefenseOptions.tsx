import React, { Dispatch, FC, SetStateAction } from 'react';
import { FormControl, FormLabel, Stack, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';

const MeleeAttackDefenseOptions: FC<{
  index: number;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData, index }) => {
  const labelId = `melee-attack-defense-options-${index}-label`;
  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;
  const disabledParry = modifiers?.disabledParry || false;
  const restrictedParry = modifiers?.restrictedParry || false;

  const minWidth = 180;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('defensive-options')}
      </FormLabel>
      <Stack direction="row" spacing={1}>
        <ToggleButtonGroup
          value={[
            !disabledDB ? 'db' : null,
            !disabledShield ? 'shield' : null,
            !disabledParry ? 'parry' : null,
            restrictedParry ? 'restrictedParry' : null,
          ].filter(Boolean)}
          onChange={(_, newValues: string[]) => {
            const enabled = new Set(newValues || []);
            const newAttacks = formData.attacks.map((a, i) =>
              i === index
                ? {
                    ...a,
                    modifiers: {
                      ...a.modifiers,
                      disabledDB: !enabled.has('db'),
                      disabledShield: !enabled.has('shield'),
                      disabledParry: !enabled.has('parry'),
                      restrictedParry: enabled.has('restrictedParry'),
                    },
                  }
                : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
          aria-label="defensive options"
        >
          <ToggleButton value="db" sx={{ minWidth: minWidth }}>
            DB
          </ToggleButton>
          <ToggleButton value="shield" sx={{ minWidth: minWidth }}>
            Shield
          </ToggleButton>
          <ToggleButton value="parry" sx={{ minWidth: minWidth }}>
            Parry
          </ToggleButton>
          <ToggleButton value="restrictedParry" sx={{ minWidth: minWidth }}>
            Restricted
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </FormControl>
  );
};

export default MeleeAttackDefenseOptions;
