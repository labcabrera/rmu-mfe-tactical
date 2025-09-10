import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import type { Action, AttackDeclarationDto } from '../../../api/actions';
import { prepareAttack } from '../../../api/actions';
import { ActorRound } from '../../../api/actor-rounds';
import type { Character } from '../../../api/characters';
import ResolveActionDialogMovementStepper from './ResolveAttackStepper';

const ResolveAttack: FC<{
  action: Action;
  actorRound: ActorRound;
  character: Character;
  onClose: () => void;
}> = ({ action, actorRound, character, onClose }) => {
  const { updateAction } = useContext(CombatContext);
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
  const { showError } = useError();
  const [isValidDeclaration, setIsValidDeclaration] = useState(false);
  const [formData, setFormData] = useState<AttackDeclarationDto>({
    attacks: [],
  });

  const onDeclare = () => {
    prepareAttack(action.id, formData)
      .then((updatedAction) => {
        console.log('Prepared attack', updatedAction);
        updateAction(updatedAction);
        setFormData({ ...formData, attacks: updatedAction.attacks });
        setActiveStep(2);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const checkValidForm = (): boolean => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) return false;
    if (formData.attacks.some((a) => !a.targetId)) return false;
    return true;
  };

  useEffect(() => {
    //TODO set formData and current step
    if (action && action.attacks) {
      setFormData({ attacks: action.attacks });
      if (action.status === 'in_progress') setActiveStep(2);
    }

    console.log('Action changed', action);
  }, [action]);

  useEffect(() => {
    setIsValidDeclaration(checkValidForm());
  }, [formData]);

  return (
    <>
      <ResolveActionDialogMovementStepper
        formData={formData}
        setFormData={setFormData}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        actorRound={actorRound}
        character={character}
        action={action}
        onClose={onClose}
        onDeclare={onDeclare}
        isValidDeclaration={isValidDeclaration}
      />
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ResolveAttack;
