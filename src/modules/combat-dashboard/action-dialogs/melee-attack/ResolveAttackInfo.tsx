import React, { FC, useContext } from 'react';
import { Chip, colors, Grid, Stack } from '@mui/material';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';
import KeyValueModifiersView from '../../../shared/generic/KeyValueModifiersView';
import AttackTitle from './AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
}> = ({ attack }) => {
  const { actorRounds } = useContext(CombatContext);

  if (!attack || !attack.calculated) return <div>Loading...</div>;

  const target = actorRounds.find((a) => a.actorId === attack.modifiers?.targetId);

  const getModifierColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return undefined;
  };

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={2}></Grid>
      <Grid size={10}>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignContent="flex-start"
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <AttackModifier value={attack.modifiers.calledShot} title="called-shot" ignoreValue="none" />
          <AttackModifier value={attack.modifiers.cover} title="cover" ignoreValue="none" />
          <AttackModifier value={attack.modifiers.positionalSource} title="positional-source" ignoreValue="none" />
          <AttackModifier value={attack.modifiers.positionalTarget} title="positional-target" ignoreValue="none" />
          <AttackModifier value={attack.modifiers.restrictedQuarters} title="restricted-quarters" ignoreValue="none" />
          <AttackModifier value={attack.modifiers.pace} title="pace" ignoreValue="creep" />
          <AttackModifierBoolean value={attack.modifiers.disabledDB} title="disabled-db" ignoreValue={true} />
          <AttackModifierBoolean value={attack.modifiers.disabledShield} title="disabled-shield" ignoreValue={true} />
          <AttackModifierBoolean value={attack.modifiers.higherGround} title="higher-ground" ignoreValue={false} />
          <AttackModifierBoolean value={attack.modifiers.stunnedFoe} title="stunned-foe" ignoreValue={false} />
          <AttackModifierBoolean value={attack.modifiers.surprisedFoe} title="surprised-foe" ignoreValue={false} />
          <AttackModifierBoolean value={attack.modifiers.surprisedFoe} title="surprised-foe" ignoreValue={false} />
          <AttackModifierBoolean value={attack.modifiers.proneTarget} title="prone-target" ignoreValue={false} />
          <AttackModifierBoolean value={attack.modifiers.proneSource} title="prone-source" ignoreValue={false} />
          <AttackModifierBoolean
            value={attack.modifiers.attackerInMelee}
            title="attacker-in-melee"
            ignoreValue={false}
          />
          <AttackModifierBoolean value={attack.modifiers.ambush} title="ambush" ignoreValue={false} />
        </Stack>
      </Grid>
      <Grid size={2}>
        <Chip
          label={`${t('total-modifiers')}: ${attack.calculated.rollTotal}`}
          color={getModifierColor(attack.calculated.rollTotal)}
        />
      </Grid>
      <Grid size={10}>
        <KeyValueModifiersView modifiers={attack.calculated.rollModifiers} />
      </Grid>
    </Grid>
  );
};

const AttackModifier: FC<{
  value: string | boolean | null;
  title: string | undefined;
  ignoreValue?: string | null;
}> = ({ value, title, ignoreValue }) => {
  return value && value !== ignoreValue ? <Chip label={`${t(title)}: ${t(String(value))}`} color="info" /> : null;
};

const AttackModifierBoolean: FC<{
  value: boolean | null;
  title: string | undefined;
  ignoreValue?: boolean | null;
}> = ({ value, title, ignoreValue }) => {
  return value && value !== ignoreValue ? <Chip label={`${t(title)}`} color="info" /> : null;
};

export default ResolveAttackFormModifiers;
