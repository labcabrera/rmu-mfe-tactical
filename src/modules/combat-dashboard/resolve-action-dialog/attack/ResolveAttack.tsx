import React, { FC, useState } from 'react';
import { useError } from '../../../../ErrorContext';
import type { Action, DeclareAttackDto } from '../../../api/actions';
import { declareAttack } from '../../../api/actions';
import type { Character } from '../../../api/characters';
import ResolveActionDialogMovementStepper from './ResolveAttackStepper';

const ResolveAttack: FC<{
  action: Action;
  character: Character;
  onClose: () => void;
}> = ({ action, character, onClose }) => {
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
  const { showError } = useError();
  const [formData, setFormData] = useState<DeclareAttackDto>({
    attacks: [],
  });

  const onDeclare = () => {
    declareAttack(action.id, formData)
      .then(() => {
        //TODO
        setActiveStep(2);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  return (
    <>
      <ResolveActionDialogMovementStepper
        formData={formData}
        setFormData={setFormData}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        character={character}
        action={action}
        onClose={onClose}
        onDeclare={onDeclare}
      />
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ResolveAttack;
