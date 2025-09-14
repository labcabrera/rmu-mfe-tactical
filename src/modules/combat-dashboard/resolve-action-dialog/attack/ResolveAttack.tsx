import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import type { Action, ActionAttack, DeclareParryDto } from '../../../api/actions';
import { prepareAttack, declareParry } from '../../../api/actions';
import { ActorRound } from '../../../api/actor-rounds.dto';
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
  const [formData, setFormData] = useState<ActionAttack>({
    attacks: [],
    parries: [],
  });

  const onDeclare = () => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) {
      showError('You must declare at least one attack');
      return;
    }
    const attackDeclarationDto = {
      attacks: formData.attacks.map((a) => a.modifiers),
      parries: formData.parries,
    };
    prepareAttack(action.id, attackDeclarationDto)
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
    if (!formData || !formData.attacks || formData.attacks.length < 1) {
      showError('You must declare at least one attack');
      return;
    }
    const parryData = { parries: [] } as DeclareParryDto;
    formData.attacks.forEach((attack) => {
      attack.parries.forEach((parry) => {
        if (parry.parry > 0) {
          parryData.parries.push({
            parryActorId: parry.parryActorId,
            targetId: attack.modifiers.targetId,
            parry: parry.parry,
          });
        }
      });
    });
    declareParry(action.id, parryData as any)
      .then((updatedAction) => {
        loadActionFromResponse(updatedAction);
        setActiveStep(3);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const loadActionFromResponse = (updatedAction: Action) => {
    if (updatedAction && updatedAction.attacks) {
      const newFormData = { attacks: updatedAction.attacks, parries: updatedAction.parries };
      updateAction(updatedAction);
      //TODO fix types when model is updated
      setFormData(newFormData as any);
    }
  };

  const checkValidForm = (): boolean => {
    if (!formData || !formData.attacks || formData.attacks.length < 1) return false;
    if (formData.attacks.some((a) => !a.modifiers.targetId)) return false;
    return true;
  };

  useEffect(() => {
    //TODO set formData and current step
    if (action && action.attacks) {
      setFormData({ attacks: action.attacks } as any);
      if (action.status === 'in_progress') setActiveStep(2);
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
        isValidDeclaration={isValidDeclaration}
      />
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ResolveAttack;
