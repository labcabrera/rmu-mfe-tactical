/* eslint-disable react/prop-types */
import React, { useContext, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveMovement } from '../../../api/actions';
import ResolveActionDialogMovementStepper from './ResolveAttackStepper';

const ResolveAttack = ({ action, character, onClose }) => {
  const { showError } = useError();
  const { game, strategicGame, updateAction } = useContext(CombatContext);
  const [activeStep, setActiveStep] = useState(action.status === 'declared' ? 0 : 1);
  const [formData, setFormData] = useState({
    targetId: '',
    attacks: [],
  });

  const onResolve = () => {
    const dataToSend = { ...formData, roll: processInteger(formData.roll) };
    resolveMovement(action.id, dataToSend)
      .then((result) => {
        updateAction(result);
        setActiveStep(1);
      })
      .catch((err) => {
        showError(err.message);
      });
  };

  const processInteger = (value) => {
    if (!value || value === '') {
      return undefined;
    }
    const check = Number(value);
    return Number.isInteger(check) ? check : undefined;
  };

  return (
    <>
      <ResolveActionDialogMovementStepper
        formData={formData}
        setFormData={setFormData}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        strategicGame={strategicGame}
        game={game}
        character={character}
        action={action}
        onClose={onClose}
        onResolve={onResolve}
      />
      <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Action: {JSON.stringify(action, null, 2)}</pre>
    </>
  );
};

export default ResolveAttack;
