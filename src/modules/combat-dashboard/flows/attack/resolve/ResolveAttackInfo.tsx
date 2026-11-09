import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Grid } from '@mui/material';
import { RollBreakdown } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack } from '../../../../api/action.dto';
import { useCombatRound } from '../../../../combat/combat-context';
import { declaredAttackSize } from '../AttackSizeVsTarget';
import AttackTitle from '../AttackTitle';

const ResolveAttackFormModifiers: FC<{
  attack: ActionAttack;
  /** Actor of the attack, to show the size of its attack (spec 075). */
  sourceActorId?: string;
}> = ({ attack, sourceActorId }) => {
  const { t } = useTranslation();
  const { actorRounds } = useCombatRound();

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
            // The breakdown always shows while the attack is resolved; before the roll its total is a prediction.
            totalLabel={
              attack.roll?.roll === null || attack.roll?.roll === undefined ? t('predicted-total') : undefined
            }
          />
        </Grid>
      )}
    </Grid>
  );
};

export default ResolveAttackFormModifiers;
