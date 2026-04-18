/* eslint-disable react-hooks/exhaustive-deps */
import React, { Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
// import { prepareAttack, declareParry, applyAttack } from '../../../api/action';
import { Action, ActionAttack, AttackDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import ResolveActionDialogMovementStepper from './MeleeAttackStepper';

const MeleeAttackForm: FC<{
  action: Action;
  actorRound: ActorRound;
  formData: AttackDeclaration;
  activeStep: number;
  availableAttacks: ActionAttack[];
  setFormData: Dispatch<SetStateAction<AttackDeclaration>>;
  setActiveStep: Dispatch<SetStateAction<number>>;
  onPrepare: () => void;
  onParry: () => void;
  onApply: () => void;
}> = ({
  action,
  actorRound,
  formData,
  activeStep,
  availableAttacks,
  setFormData,
  setActiveStep,
  onPrepare,
  onParry,
  onApply,
}) => {
  // const [isValidDeclaration, setIsValidDeclaration] = useState(false);

  // const applyCurrentBoToAttacks = (attacks?: AttackDeclaration['attacks']) => {
  //   if (!attacks || !actorRound || !actorRound.attacks) return attacks || [];
  //   return attacks.map((a) => {
  //     try {
  //       const attackName = a?.attackName;
  //       const baseBo = actorRound.attacks.find((at) => at.attackName === attackName)?.currentBo ?? 0;
  //       const bo = a?.modifiers?.bo ?? baseBo;
  //       return { ...a, modifiers: { ...a.modifiers, bo } };
  //     } catch (e) {
  //       console.error('Error applying current BO to attack', e);
  //       return a;
  //     }
  //   });
  // };

  // const onDeclareAttack = () => {
  //   if (!formData || !formData.attacks || formData.attacks.length < 1) {
  //     showError('You must declare at least one attack');
  //     return;
  //   }
  //   prepareAttack(action.id, formData)
  //     .then((updatedAction) => {
  //       loadActionFromResponse(updatedAction);
  //       setActiveStep(2);
  //     })
  //     .catch((err: Error) => showError(err.message));
  // };

  // const onParryAttack = () => {
  //   const parryDeclaration = { parries: [] } as ParryDeclaration;
  //   formData.parries.forEach((p) => {
  //     parryDeclaration.parries.push({ parryId: p.id, parry: p.parry });
  //   });
  //   declareParry(action.id, parryDeclaration)
  //     .then((updatedAction) => {
  //       loadActionFromResponse(updatedAction);
  //       setActiveStep(3);
  //     })
  //     .catch((err: Error) => showError(err.message));
  // };

  // const onApplyAttack = () => {
  //   applyAttack(action.id)
  //     .then((updatedAction) => {
  //       loadActionFromResponse(updatedAction);
  //       setActiveStep(3);
  //       refreshActorRounds();
  //     })
  //     .catch((err: Error) => showError(err.message));
  // };

  // const loadActionFromResponse = (updatedAction: Action) => {
  //   updateAction(updatedAction);
  //   setFormData({ attacks: applyCurrentBoToAttacks(updatedAction.attacks), parries: updatedAction.parries });
  // };

  // const checkValidForm = (): boolean => {
  //   if (!formData || !formData.attacks || formData.attacks.length < 1) return false;
  //   if (formData.attacks.some((a) => !a.modifiers.targetId)) return false;
  //   return true;
  // };

  // useEffect(() => {
  //   if (action && action.attacks) {
  //     setFormData({ attacks: applyCurrentBoToAttacks(action.attacks), parries: action.parries });
  //     if (action.status === 'declared') {
  //       setActiveStep(0);
  //     } else if (action.status === 'parry') {
  //       setActiveStep(2);
  //     } else {
  //       setActiveStep(3);
  //     }
  //   }
  //   if (action && action.status) {
  //     switch (action.status) {
  //       case 'completed':
  //         setActiveStep(3);
  //         break;
  //     }
  //   }
  // }, [action]);

  // useEffect(() => {
  //   if (formData) {
  //     setIsValidDeclaration(checkValidForm());
  //   }
  // }, [formData]);

  if (!formData) return <div>Loading (MeleeAttackForm !formData)...</div>;

  return (
    <>
      <ResolveActionDialogMovementStepper
        action={action}
        formData={formData}
        setFormData={setFormData}
        activeStep={activeStep}
        actorRound={actorRound}
        availableAttacks={availableAttacks}
      />
    </>
  );
};

export default MeleeAttackForm;
