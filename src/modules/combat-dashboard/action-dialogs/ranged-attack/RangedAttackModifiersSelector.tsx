import React, { Dispatch, FC, SetStateAction } from 'react';
import { Badge, Grid, Stack, Typography } from '@mui/material';
import { AttackDeclaration } from '../../../api/action.dto';
import ToggleButton from '../../../shared/buttons/ToggleButton';

const RangedAttackModifiersSelector: FC<{
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const attack = formData.attacks?.[index];
  const modifiers = attack?.modifiers;
  const disabledDB = modifiers?.disabledDB || false;
  const disabledShield = modifiers?.disabledShield || false;
  const disabledParry = modifiers?.disabledParry || false;
  const higherGround = modifiers?.higherGround || false;
  const stunnedFoe = modifiers?.stunnedFoe || false;
  const surprisedFoe = modifiers?.surprisedFoe || false;
  const proneSource = modifiers?.proneSource || false;
  const proneTarget = modifiers?.proneTarget || false;
  const ambush = modifiers?.ambush || false;

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
          Attack modifiers
        </Typography>
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
        </Stack>
      </Grid>
      <Grid size={12}>
        <Typography variant="body2" gutterBottom>
          Attack modifiers
        </Typography>
        <Stack direction="row" spacing={3}>
          <Badge badgeContent={'+10'} color={'success'}>
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
          <Badge badgeContent={'+20'} color={'success'}>
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
          <Badge badgeContent={'+25'} color={'success'}>
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
          <Badge badgeContent={'-30'} color={'error'}>
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
          <Badge badgeContent={'-50'} color={'error'}>
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
      </Grid>
    </Grid>
  );
};

export default RangedAttackModifiersSelector;
