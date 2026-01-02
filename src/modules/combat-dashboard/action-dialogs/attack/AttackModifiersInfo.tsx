import React, { FC } from 'react';
import { Chip, Stack } from '@mui/material';
import { t } from 'i18next';
import { ActionAttack } from '../../../api/action.dto';

export const AttackModifiersInfo: FC<{
  attack: ActionAttack;
}> = ({ attack }) => {
  const modifiers = attack.modifiers;

  if (!modifiers) return <p>Loading ...</p>;

  return (
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
      <AttackModifier value={modifiers.calledShot} title="called-shot" ignoreValue="none" />
      <AttackModifier value={modifiers.cover} title="cover" ignoreValue="none" />
      <AttackModifier value={modifiers.positionalSource} title="positional-source" ignoreValue="none" />
      <AttackModifier value={modifiers.positionalTarget} title="positional-target" ignoreValue="none" />
      <AttackModifier value={modifiers.restrictedQuarters} title="restricted-quarters" ignoreValue="none" />
      <AttackModifier value={modifiers.pace} title="pace" ignoreValue="creep" />
      <AttackModifierBoolean value={modifiers.disabledDB} title="disabled-db" ignoreValue={true} />
      <AttackModifierBoolean value={modifiers.disabledShield} title="disabled-shield" ignoreValue={true} />
      <AttackModifierBoolean value={modifiers.higherGround} title="higher-ground" ignoreValue={false} />
      <AttackModifierBoolean value={modifiers.stunnedFoe} title="stunned-foe" ignoreValue={false} />
      <AttackModifierBoolean value={modifiers.surprisedFoe} title="surprised-foe" ignoreValue={false} />
      <AttackModifierBoolean value={modifiers.proneTarget} title="prone-target" ignoreValue={false} />
      <AttackModifierBoolean value={modifiers.proneSource} title="prone-source" ignoreValue={false} />
      <AttackModifierBoolean value={modifiers.attackerInMelee} title="attacker-in-melee" ignoreValue={false} />
      <AttackModifierBoolean value={attack.modifiers.ambush} title="ambush" ignoreValue={false} />
    </Stack>
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

export default AttackModifiersInfo;
