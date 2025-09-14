import React, { FC, useContext } from 'react';
import { Stack, Chip } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { AttackDeclarationItemDto as ResolveAttackInfo } from '../../../api/actions';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import ActorRoundArmor from './ActorRoundArmor';

const ResolveAttackFormModifiers: FC<{
  attack: ResolveAttackInfo;
}> = ({ attack }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!attack) return <div>Loading...</div>;

  const getTarget = () => {
    return actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);
  };

  const getModifierColor = (value: number) => {
    if (value > 0) return 'primary';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <>
      <Grid size={2}>
        <TextField label={t('target')} value={getTarget()?.name || ''} name="target" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('attack-used-bo')} value={attack.modifiers.bo} name="target" />
      </Grid>
      <Grid size={2}>
        <ActorRoundArmor actorRound={getTarget()} />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <TextField label={t('cover')} value={t(`cover-${attack.modifiers.cover}`)} name="cover" fullWidth variant="standard" />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('restricted-quarters')}
          value={t(attack.modifiers.restrictedQuarters)}
          name="restrictedQuarters"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('positional-source')}
          value={t(`positional-${attack.modifiers.positionalSource}`)}
          name="positionalSource"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField
          label={t('positional-target')}
          value={t(`positional-${attack.modifiers.positionalTarget}`)}
          name="positionalTarget"
          fullWidth
          variant="standard"
        />
      </Grid>
      <Grid size={2}>
        <TextField label={t('attack-dodge')} value={t(`dodge-${attack.modifiers.dodge}`)} name="dodge" fullWidth variant="standard" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={attack.modifiers.disabledDB} name="disabledDB" />} label="Disabled DB" />
      </Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={attack.modifiers.disabledShield} name="disabledShield" />} label="Disabled Shield" />
      </Grid>
      <Grid size={2}>
        <FormControlLabel control={<Switch checked={attack.modifiers.disabledParry} name="disabledParry" />} label="Disabled Parry" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('custom-bonus')} value={attack.modifiers.customBonus} name="customBonus" />
      </Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('range')} value={attack.modifiers.range} name="range" />
      </Grid>
      <Grid size={12}></Grid>
      <Grid size={2}>
        <NumericReadonlyInput label={t('total-modifiers')} value={attack.calculated.rollTotal} name="totalModifiers" />
      </Grid>
      <Grid size={12}>
        <Stack direction="row" spacing={1}>
          {attack.calculated.rollModifiers.map((item, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Chip label={`${t(item.key)}: ${item.value}`} color={getModifierColor(item.value)} />
            </Stack>
          ))}
        </Stack>
      </Grid>
    </>
  );
};

export default ResolveAttackFormModifiers;
