import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveMovement } from '../../../api/action';
import { Action, ResolveMovementDto } from '../../../api/action.dto';
import type { Character } from '../../../api/characters';
import type { TacticalGame } from '../../../api/tactical-games';
import ResolveMovementStepper from './ResolveMovementStepper';

const ResolveMovement: FC<{
  action: Action;
  character: Character;
  onClose: () => void;
}> = ({ action, character, onClose }) => {
  const { showError } = useError();
  const { game, strategicGame, updateAction } = useContext(CombatContext)!;
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<ResolveMovementDto>({
    phase: parseInt((game as TacticalGame).phase.replace('phase_', '')),
    pace: '',
    requiredManeuver: false,
    difficulty: character.equipment.movementBaseDifficulty || '',
    skillId: 'running',
    roll: null,
  });

  const processInteger = (value: unknown): number | undefined => {
    if (!value || value === '') {
      return undefined;
    }
    const check = Number(value);
    return Number.isInteger(check) ? check : undefined;
  };

  const onResolve = () => {
    const dataToSend = { ...formData, roll: processInteger(formData.roll) };
    resolveMovement(action.id, dataToSend)
      .then((result: Action) => {
        updateAction(result);
        setActiveStep(1);
      })
      .catch((err: Error) => showError(err.message));
  };

  const checkValidForm = () => {
    let check = true;
    if (!formData.pace) check = false;
    else if (formData.requiredManeuver && !formData.roll) check = false;
    setIsValidForm(check);
  };

  useEffect(() => {
    checkValidForm();
  }, [formData]);

  return (
    <ResolveMovementStepper
      formData={formData}
      setFormData={setFormData}
      activeStep={activeStep}
      setActiveStep={setActiveStep}
      strategicGame={strategicGame}
      game={game}
      character={character}
      action={action}
      isValidForm={isValidForm}
      onClose={onClose}
      onResolve={onResolve}
    />
  );
};

export default ResolveMovement;
