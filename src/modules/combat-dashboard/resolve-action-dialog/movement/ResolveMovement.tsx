import React, { useContext, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { useError } from '../../../../ErrorContext';
import { resolveMovement } from '../../../api/actions';
import type { Action, ResolveMovementDto } from '../../../api/actions';
import type { Character } from '../../../api/characters';
import type { TacticalGame } from '../../../api/tactical-games';
import ResolveMovementStepper from './ResolveMovementStepper';

type ResolveMovementProps = {
  action: Action;
  character: Character;
  onClose: () => void;
};

const ResolveMovement: React.FC<ResolveMovementProps> = ({ action, character, onClose }) => {
  const { showError } = useError();
  const { game, strategicGame, updateAction } = useContext(CombatContext)!;
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
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
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

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
      onClose={onClose}
      onResolve={onResolve}
    />
  );
};

export default ResolveMovement;
