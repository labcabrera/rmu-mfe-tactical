import React, { FC, useContext } from 'react';
import { Grid } from '@mui/material';
import { RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../../CombatContext';
import { ActionAttack } from '../../../api/action.dto';
import { declaredAttackSize } from '../../panel/flows/attack/AttackSizeVsTarget';
import AttackTitle from '../melee-attack/AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
  /** Actor of the attack, to show the size of its attack (spec 075). */
  sourceActorId?: string;
}> = ({ attack, sourceActorId }) => {
  const { actorRounds } = useContext(CombatContext)!;

  if (!attack || !attack.calculated) return null;

  const target = actorRounds!.find((a) => a.actorId === attack.modifiers?.targetId)!;

  return (
    <Grid container spacing={1} sx={{ marginTop: 1, marginBottom: 1 }}>
      <Grid size={12}>
        <AttackTitle
          attack={attack}
          target={target}
          attackSize={declaredAttackSize(attack, actorRounds, sourceActorId)}
        />
      </Grid>
      {attack.calculated.rollModifiers && (
        <Grid size={12}>
          <RollBreakdown
            modifiers={attack.calculated.rollModifiers}
            roll={attack.roll?.roll}
            total={attack.calculated.rollTotal}
            skipped={attack.calculated.skipped}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
