import React, { FC, useContext } from 'react';
import { Grid } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { Action, ActionAttack } from '../../../api/action.dto';
import AttackTitle from '../melee-attack/AttackTitle';
import ModifierDualList from '../movement/ModifierDualList';
import AttackModifiersInfo from './AttackModifiersInfo';

const ResolveAttackFormModifiers: FC<{
  action: Action;
  attack: ActionAttack;
}> = ({ action, attack }) => {
  const { actorRounds } = useContext(CombatContext)!;

  if (!attack || !attack.calculated) return <div>Loading ResolveAttackFormModifiers...</div>;

  const target = actorRounds!.find((a) => a.actorId === attack.modifiers?.targetId)!;

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
      </Grid>
      <Grid size={2}></Grid>
      <Grid size={10}>
        <AttackModifiersInfo attack={attack} action={action} />
      </Grid>
      {attack.calculated.rollModifiers && (
        <Grid size={12}>
          <ModifierDualList modifiers={attack.calculated.rollModifiers} />
        </Grid>
      )}
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
