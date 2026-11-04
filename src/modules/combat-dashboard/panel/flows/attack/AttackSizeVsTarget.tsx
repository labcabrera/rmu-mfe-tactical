import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { AttackSizeChip, attackSizeEffect, expectedCriticalShift } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActionAttack } from '../../../../api/action.dto';
import { ActorRound } from '../../../../api/actor-rounds.dto';

/** Size of a target for the criticals, in steps from Medium: its critical size if it has one (spec 075). */
export const targetCriticalSteps = (target?: ActorRound | null): number => target?.criticalSize ?? target?.size ?? 0;

/**
 * Size of a declared attack, in steps from Medium: the one of the attacker's attack with that name, else the one the
 * API recorded when it moved the critical.
 */
export const declaredAttackSize = (
  attack: ActionAttack,
  actorRounds: ActorRound[] | null | undefined,
  sourceActorId?: string
): number => {
  const recorded = attack.results?.severityAdjustment?.steps.find((step) => step.key === 'attack-size')?.value;
  if (recorded !== undefined) return recorded;
  if (!sourceActorId) return 0;
  const source = actorRounds?.find((ar) => ar.actorId === sourceActorId);
  return source?.attacks?.find((each) => each.attackName === attack.attackName)?.attackSize ?? 0;
};

/**
 * The size of an attack against its target (workspace spec 075): the chip of the attack size and the critical levels
 * it is expected to move (before the charge and the style; with the code I of the target). Nothing when both are Medium-like (no shift).
 */
const AttackSizeVsTarget: FC<{ attackSize: number; target?: ActorRound | null }> = ({ attackSize, target }) => {
  const { t } = useTranslation();
  const targetSteps = targetCriticalSteps(target);
  // Code I of the target takes one more level off
  const shift = expectedCriticalShift(attackSize, targetSteps) - (target?.reduceCriticalSeverity ? 1 : 0);
  if (attackSizeEffect(attackSize).steps === 0 && shift === 0) return null;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
      <AttackSizeChip steps={attackSize} targetSteps={target ? targetSteps : undefined} showMedium />
      {target && shift !== 0 && (
        <Typography variant="caption" color="text.secondary">
          {t('attack-size-vs-target', {
            target: t(`size-${attackSizeEffect(targetSteps).sizeId}`),
            shift: shift > 0 ? `+${shift}` : `${shift}`,
          })}
        </Typography>
      )}
    </Stack>
  );
};

export default AttackSizeVsTarget;
