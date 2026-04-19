import React, { FC, useContext } from 'react';
import { Grid } from '@mui/material';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';
import ModifierDualList from '../../../shared/ModifierDualList';
import AttackTitle from '../melee-attack/AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
}> = ({ attack }) => {
  const { actorRounds } = useContext(CombatContext)!;

  if (!attack || !attack.calculated) return <div>Loading ResolveAttackFormModifiers...</div>;

  const target = actorRounds!.find((a) => a.actorId === attack.modifiers?.targetId)!;

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle attack={attack} target={target} />
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
