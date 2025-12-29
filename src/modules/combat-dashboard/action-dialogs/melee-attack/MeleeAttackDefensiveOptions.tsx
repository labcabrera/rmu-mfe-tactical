import React, { Dispatch, FC, SetStateAction } from 'react';
import { FormControl, FormLabel, Stack } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';
import ToggleButton from '../../../shared/buttons/ToggleButton';

const MeleeAttackDefensiveOptions: FC<{
  index: number;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData, index }) => {
  const labelId = `melee-attack-defensive-options-${index}-label`;
  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;
  const disabledParry = modifiers?.disabledParry || false;
  const restrictedParry = modifiers?.restrictedParry || false;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('defensive-options')}
      </FormLabel>
      <Stack direction="row" spacing={1}>
        <ToggleButton
          label={'DB'}
          value={!disabledDB}
          onChange={(newValue) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, disabledDB: !newValue } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
        <ToggleButton
          label={'Shield'}
          value={!disabledShield}
          onChange={(newValue) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, disabledShield: !newValue } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
        <ToggleButton
          label={'Parry'}
          value={!disabledParry}
          onChange={(newValue) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, disabledParry: !newValue } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
        <ToggleButton
          label={'Restricted parry'}
          value={restrictedParry}
          onChange={(newValue) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, restrictedParry: newValue } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
      </Stack>
    </FormControl>
  );
};

export default MeleeAttackDefensiveOptions;
