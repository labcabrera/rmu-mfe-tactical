import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { prepareAttack, declareParry, applyAttack } from '../../../api/action';
import { Action, AttackDeclaration, ParryDeclaration } from '../../../api/action.dto';
import { ActorRound } from '../../../api/actor-rounds.dto';
import type { Character } from '../../../api/characters';
import ResolveActionDialogMovementStepper from './ResolveAttackStepper';

const ActionAttack: FC<{
  action: Action;
  actorRound: ActorRound;
  character: Character;
  onClose: () => void;
}> = ({ action, actorRound, character, onClose }) => {
  const { refreshActorRounds, updateAction } = useContext(CombatContext);
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
  const { showError } = useError();
  const [isValidDeclaration, setIsValidDeclaration] = useState(false);
  const [formData, setFormData] = useState<AttackDeclaration>({
    attacks: [],
    parries: [],
  });

  const onDeclare = () => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) {
      showError('You must declare at least one attack');
      return;
    }
    prepareAttack(action.id, formData)
      .then((updatedAction) => {
        loadActionFromResponse(updatedAction);
        setActiveStep(2);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const onParry = () => {
    const parryDeclaration = { parries: [] } as ParryDeclaration;
    formData.parries.forEach((p) => {
      parryDeclaration.parries.push({ parryId: p.id, parry: p.parry });
    });
    declareParry(action.id, parryDeclaration)
      .then((updatedAction) => {
        loadActionFromResponse(updatedAction);
        setActiveStep(3);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const onApply = () => {
    applyAttack(action.id)
      .then((updatedAction) => {
        loadActionFromResponse(updatedAction);
        setActiveStep(3);
        refreshActorRounds();
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const loadActionFromResponse = (updatedAction: Action) => {
    updateAction(updatedAction);
    setFormData({ attacks: updatedAction.attacks, parries: updatedAction.parries });
  };

  const checkValidForm = (): boolean => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) return false;
    if (formData.attacks.some((a) => !a.modifiers.targetId)) return false;
    return true;
  };

  useEffect(() => {
    if (action && action.attacks) {
      setFormData({ attacks: action.attacks, parries: action.parries });
    }
    if (action && action.status) {
      switch (action.status) {
        case 'completed':
          setActiveStep(3);
          break;
      }
    }
  }, [action]);

  useEffect(() => {
    if (formData) {
      setIsValidDeclaration(checkValidForm());
    }
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
        onParry={onParry}
        onApply={onApply}
        isValidDeclaration={isValidDeclaration}
      />
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ActionAttack;
