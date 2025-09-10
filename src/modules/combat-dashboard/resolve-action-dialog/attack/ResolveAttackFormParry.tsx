import React, { FC, useContext } from 'react';
import { Stack, Chip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackCalculationsDto, AttackDto } from '../../../api/actions';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { characters } = useContext(CombatContext);

  const modifiers = formData.attacks?.[index]?.modifiers;
  const customBonus = formData.attacks?.[index]?.modifiers.customBonus || null;
  const restrictedQuarters = formData.attacks?.[index]?.modifiers.restrictedQuarters || '';
  const positionalSource = formData.attacks?.[index]?.modifiers.positionalSource || '';
  const positionalTarget = formData.attacks?.[index]?.modifiers.positionalTarget || '';
  const dodge = formData.attacks?.[index]?.modifiers.dodge || '';
  const range = formData.attacks?.[index]?.modifiers.range || null;
  const disabledDB = formData.attacks?.[index]?.modifiers.disabledDB || false;
  const disabledShield = formData.attacks?.[index]?.modifiers.disabledShield || false;
  const disabledParry = formData.attacks?.[index]?.modifiers.disabledParry || false;
  const targetName = characters.find((c) => c.id === formData.attacks?.[index]?.modifiers.targetId)?.name || '';
  const calculated = formData.attacks?.[index]?.calculated || ({} as AttackCalculationsDto);

  const getModifierColor = (value: number) => {
    if (value > 0) return 'primary';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Grid container spacing={2} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={2}>
        <TextField label={t('target')} value={targetName} name="target" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('attack-used-bo')} value={modifiers.bo} name="target" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <TextField label={t('attack-cover')} value={t(`cover-${modifiers.cover}`)} name="cover" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('attack-restricted-quarters')}
          value={t(modifiers.restrictedQuarters)}
          name="restrictedQuarters"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('attack-positional-source')}
          value={t(`positional-${modifiers.positionalSource}`)}
          name="positionalSource"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('attack-positional-target')}
          value={t(`positional-${modifiers.positionalTarget}`)}
          name="positionalTarget"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField label={t('attack-dodge')} value={t(`dodge-${modifiers.dodge}`)} name="dodge" fullWidth variant="standard" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={!!disabledDB} name="disabledDB" />} label="Disabled DB" />
        <FormControlLabel control={<Switch checked={!!disabledShield} name="disabledShield" />} label="Disabled Shield" />
        <FormControlLabel control={<Switch checked={!!disabledParry} name="disabledParry" />} label="Disabled Parry" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('custom-bonus')} value={customBonus} name="customBonus" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('range')} value={range} name="range" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('total-modifiers')} value={calculated.rollTotal} name="totalModifiers" />
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={1}>
          {calculated.rollModifiers.map((item, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Chip label={`${t(item.key)}: ${item.value}`} color={getModifierColor(item.value)} />
            </Stack>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
