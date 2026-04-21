import React, { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Grid, Typography } from '@mui/material';
import { CategorySeparator } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { CombatContext } from '../../../../CombatContext';
import { Action, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import {
  actorRoundHasEffect,
  isActorRoundDisabled,
  isActorRoundProne,
  isActorRoundStunned,
} from '../../../services/actor-round-service';
import ResolveAttackFormRoll from '../attack/ResolveAttackFormRoll';
import TargetSelector from '../melee-attack/TargetSelector';
import RangedAttackModifiersForm from './RangedAttackModifiersForm';

const RangedAttackForm: FC<{
  actorRound: ActorRound;
  action: Action;
  formData: AttackDeclaration;
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
}> = ({ actorRound, action, formData, setFormData }) => {
  const { actorRounds } = useContext(CombatContext)!;
  const selected = formData.attacks || [];

  const handleTargetChange = (attackName: string, targetId: string) => {
    if (!targetId) return;
    const targetActorRound = actorRounds!.find((e) => e.actorId === targetId)!;
    const isTargetDisabled = isActorRoundDisabled(actorRound);
    const newSelected = selected.map((a) =>
      a.attackName === attackName
        ? {
            ...a,
            modifiers: {
              ...a.modifiers,
              targetId: targetId,
              proneTarget: isActorRoundProne(targetActorRound),
              stunnedFoe: isActorRoundStunned(targetActorRound),
              disabledDB: isTargetDisabled,
              disabledShield: isTargetDisabled,
              surprisedFoe: actorRoundHasEffect(targetActorRound, ['surprised']),
              customBonus: 0,
            },
          }
        : a
    );
    setFormData({ ...formData, attacks: newSelected });
  };

  if (!formData) return <p>Loading...</p>;

  if (!actorRound || (!actorRound.attacks && !action.attacks)) {
    return <Typography>No ranged attacks available</Typography>;
  }

  return (
    <>
      {(formData.attacks || []).map((actionAttack, index) => {
        const actorRoundAttack = actorRound.attacks.find((e) => e.attackName === actionAttack.attackName)!;
        const displayTable = actorRoundAttack?.attackTable || '';

        return (
          <div key={index}>
            {!actionAttack.calculated && (
              <>
                <CategorySeparator text={t(actionAttack.attackName)} />
                <Grid container spacing={1} alignItems="center">
                  <Grid size={2}>
                    {t(displayTable)} +{actionAttack.modifiers.bo}
                  </Grid>
                  <Grid size={10} mb={5}>
                    <TargetSelector
                      value={actionAttack.modifiers.targetId || ''}
                      onChange={(actorId) => handleTargetChange(actionAttack.attackName, actorId!)}
                      sourceId={actorRound.actorId}
                    />
                  </Grid>
                </Grid>
                <RangedAttackModifiersForm
                  action={action}
                  attack={actorRoundAttack}
                  formData={formData}
                  setFormData={setFormData}
                  index={selected.findIndex((a) => a.attackName === actionAttack.attackName)}
                />
              </>
            )}
            {actorRoundAttack && actorRoundAttack && actionAttack.calculated && (
              <ResolveAttackFormRoll
                formData={formData}
                setFormData={setFormData}
                action={action}
                attack={actionAttack}
                index={index}
              />
            )}
          </div>
        );
      })}
    </>
  );
};

export default RangedAttackForm;
