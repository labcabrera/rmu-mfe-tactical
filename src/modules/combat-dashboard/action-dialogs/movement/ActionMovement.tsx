import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { Action } from '../../../api/action.dto';
import type { Character } from '../../../api/characters';
import ResolveMovementForm from './ResolveMovementForm';

const ActionMovement: FC<{
  action: Action;
  character: Character;
  onClose: () => void;
}> = ({ action, character }) => {
  const { game, strategicGame } = useContext(CombatContext)!;
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (action.movement) {
      setFormData(() => ({
        modifiers: action.movement.modifiers,
        roll: action.movement.roll,
      }));
    } else {
      setFormData(() => ({
        modifiers: {
          pace: '',
          requiredManeuver: false,
          skillId: 'running',
          difficulty: character.equipment.movementBaseDifficulty || '',
        },
        roll: {
          roll: null,
        },
      }));
    }
  }, [action]);

  if (!formData) return <div>Loading...</div>;

  return (
    <ResolveMovementForm
      formData={formData}
      setFormData={setFormData}
      character={character}
      strategicGame={strategicGame}
      action={action}
      game={game}
    />
  );
};

export default ActionMovement;
