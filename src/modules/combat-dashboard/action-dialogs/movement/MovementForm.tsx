import React, { FC, useContext, useEffect, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import { Action } from '../../../api/action.dto';
import { Character } from '../../../api/characters.dto';
import MovementModifiersForm from './MovementModifiersForm';

//TODO remove character. Read from actor
const MovementForm: FC<{
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
          customModifier: null,
        },
        roll: {
          roll: null,
        },
      }));
    }
  }, [action]);

  if (!formData) return <div>Loading...</div>;

  return (
    <MovementModifiersForm
      formData={formData}
      setFormData={setFormData}
      character={character}
      strategicGame={strategicGame}
      action={action}
      game={game}
    />
  );
};

export default MovementForm;
