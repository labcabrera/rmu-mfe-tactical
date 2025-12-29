import React, { Dispatch, FC, SetStateAction } from 'react';
import { Badge, FormControl, FormLabel, Stack } from '@mui/material';
import { t } from 'i18next';
import { AttackDeclaration } from '../../../api/action.dto';
import ToggleButton from '../../../shared/buttons/ToggleButton';

const MeleeAttackOptions: FC<{
  index: number;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ formData, setFormData, index }) => {
  const labelId = `melee-attack-options-${index}-label`;
  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const higherGround = modifiers?.higherGround || false;
  const stunnedFoe = modifiers?.stunnedFoe || false;
  const surprisedFoe = modifiers?.surprisedFoe || false;
  const proneSource = modifiers?.proneSource || false;
  const proneTarget = modifiers?.proneTarget || false;
  const offHand = modifiers?.offHand || false;
  const ambush = modifiers?.ambush || false;

  return (
    <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
      <FormLabel id={labelId} component="legend" sx={{ mb: 1, typography: 'body1' }}>
        {t('attack-options')}
      </FormLabel>
      <Stack direction="row" spacing={3}>
        <Badge badgeContent={'+10'} color="success">
          <ToggleButton
            label={'Higher ground'}
            value={higherGround}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, higherGround: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <Badge badgeContent={'+20'} color="success">
          <ToggleButton
            label={'Stunned foe'}
            value={stunnedFoe}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, stunnedFoe: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <Badge badgeContent={'+25'} color="success">
          <ToggleButton
            label={'Surprised foe'}
            value={surprisedFoe}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, surprisedFoe: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <Badge badgeContent={'-50'} color="error">
          <ToggleButton
            label={'Prone target'}
            value={proneTarget}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, proneTarget: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <Badge badgeContent={'-50'} color="error">
          <ToggleButton
            label={'Prone attacker'}
            value={proneSource}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, proneSource: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <Badge badgeContent={'-20'} color="error">
          <ToggleButton
            label={'Off-hand'}
            value={offHand}
            onChange={(newValue) => {
              const newAttacks = formData.attacks.map((a, i) =>
                i === index ? { ...a, modifiers: { ...a.modifiers, offHand: newValue } } : a
              );
              setFormData({ ...formData, attacks: newAttacks });
            }}
          />
        </Badge>
        <ToggleButton
          label={'Ambush'}
          value={ambush}
          onChange={(newValue) => {
            const newAttacks = formData.attacks.map((a, i) =>
              i === index ? { ...a, modifiers: { ...a.modifiers, ambush: newValue } } : a
            );
            setFormData({ ...formData, attacks: newAttacks });
          }}
        />
      </Stack>
    </FormControl>
  );
};

export default MeleeAttackOptions;
