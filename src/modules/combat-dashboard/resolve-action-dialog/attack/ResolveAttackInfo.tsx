import React, { FC, useContext } from 'react';
import { Stack, Chip, Grid, TextField, FormControlLabel, Switch } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';
import NumericReadonlyInput from '../../../shared/inputs/NumericReadonlyInput';
import ActorRoundArmor from './ActorRoundArmor';
import AttackTitle from './AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
  showDetail?: boolean;
}> = ({ attack, showDetail = false }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!attack || !attack.calculated) return <div>Loading...</div>;

  const target = actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);

  const getModifierColor = (value: number) => {
    if (value > 0) return 'primary';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={12}></Grid>
      {showDetail && (
        <>
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
          <Grid size={2}>
            <NumericReadonlyInput label={t('range')} value={attack.modifiers.range} name="range" />
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
        </>
      )}
      <Grid size={2}>
        <Chip label={`${t('total-modifiers')}: ${attack.calculated.rollTotal}`} />
      </Grid>
      <Grid size={10}>
        <Stack direction="row" spacing={1}>
          {attack.calculated.rollModifiers.map((item, index) => (
            <Stack key={index} direction="row" spacing={1}>
              <Chip label={`${t(item.key)}: ${item.value}`} color={getModifierColor(item.value)} />
            </Stack>
          ))}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
