import React, { FC, useContext, useEffect } from 'react';
import { Stack, Chip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackCalculationsDto, AttackDto, AttackParryDto } from '../../../api/actions';
import { NumericInput } from '../../../shared/inputs/NumericInput';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';

const ResolveAttackFormModifiers: FC<{
  formData: AttackDto;
  setFormData: (data: AttackDto) => void;
  index: number;
}> = ({ formData, setFormData, index }) => {
  const { characters, actorRounds } = useContext(CombatContext);
  const [parryFormData, setParryFormData] = React.useState<AttackParryDto>(null);

  const modifiers = formData.attacks?.[index]?.modifiers;
  const targetName = characters.find((c) => c.id === formData.attacks?.[index]?.modifiers.targetId)?.name || '';
  const calculated = formData.attacks?.[index]?.calculated || ({} as AttackCalculationsDto);

  const getAvailableParry = (attackName: string) => {
    return 10;
  };

  const handleChange = (name: string, value: string | boolean | number | null) => {
    const newAttacks = formData.attacks.map((a, i) => (i === index ? { ...a, modifiers: { ...a.modifiers, [name]: value } } : a));
    setFormData({ ...formData, attacks: newAttacks });
  };

  const getModifierColor = (value: number) => {
    if (value > 0) return 'primary';
    if (value < 0) return 'error';
    return undefined;
  };

  const bindParryFormData = (formData: AttackDto) => {
    console.log('Bind parry form data');
    for (const attack of formData.attacks) {
      const attackParryDto = { parries: [] } as AttackParryDto;
      const targetActorId = attack.modifiers.targetId;
      const targetAttaks = actorRounds.find((e) => e.actorId === targetActorId)?.attacks || [];
      for (const targetAttack of targetAttaks) {
        attackParryDto.parries.push({
          attackSourceName: attack.modifiers.attackName,
          attackTargetName: targetAttack.attackName,
          availableParry: targetAttack.currentBo,
          parry: 0,
        });
      }
      setParryFormData(attackParryDto);
    }
  };

  useEffect(() => {
    if (formData && !parryFormData) {
      bindParryFormData(formData);
    }
  }, [formData]);

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
        <TextField label={t('cover')} value={t(`cover-${modifiers.cover}`)} name="cover" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <TextField label={t('restricted-quarters')} value={t(modifiers.restrictedQuarters)} name="restrictedQuarters" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('positional-source')}
          value={t(`positional-${modifiers.positionalSource}`)}
          name="positionalSource"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('positional-target')}
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
        <FormControlLabel control={<Switch checked={modifiers.disabledDB} name="disabledDB" />} label="Disabled DB" />
      </Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={modifiers.disabledShield} name="disabledShield" />} label="Disabled Shield" />
      </Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={modifiers.disabledParry} name="disabledParry" />} label="Disabled Parry" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('custom-bonus')} value={modifiers.customBonus} name="customBonus" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('range')} value={modifiers.range} name="range" />
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
      <Grid size={12}></Grid>
      {parryFormData && parryFormData.parries.length > 0 && (
        <>
          {parryFormData.parries.map((p, index) => (
            <React.Fragment key={index}>
              <Grid size={2}>
                <TextField label={t('defending-with')} value={t(p.attackTargetName)} name="attackTargetName" variant="standard" />
              </Grid>
              <Grid size={2}>
                <NumericReadonlyInput label={t('available-parry')} value={p.availableParry} name="availableParry" />
              </Grid>
              <Grid size={2}>
                <NumericInput
                  label={t('parry')}
                  value={p.parry}
                  name="parry"
                  onChange={(e) => {
                    const newParries = parryFormData.parries.map((parry, idx) => (idx === index ? { ...parry, parry: e } : parry));
                    setParryFormData({ ...parryFormData, parries: newParries });
                    handleChange('parry', e);
                  }}
                  integer
                  allowNegatives={false}
                  max={p.availableParry}
                  min={0}
                />
              </Grid>
              <Grid size={6}></Grid>
            </React.Fragment>
          ))}
        </>
      )}
      <Grid size={12}>
        <pre>Parry: {JSON.stringify(parryFormData, null, 2)}</pre>
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
