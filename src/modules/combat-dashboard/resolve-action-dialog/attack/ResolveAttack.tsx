import React, { useContext, useState } from 'react';
import { CombatContext } from '../../../../CombatContext';
import type { Action, DeclareAttackDto } from '../../../api/actions';
import type { Character } from '../../../api/characters';
import type { StrategicGame } from '../../../api/strategic-games';
import type { TacticalGame } from '../../../api/tactical-games';
import ResolveActionDialogMovementStepper from './ResolveAttackStepper';

type ResolveAttackProps = {
  action: Action;
  character: Character;
  onClose: () => void;
};

const ResolveAttack: React.FC<ResolveAttackProps> = ({ action, character, onClose }) => {
  const { game, strategicGame } = useContext(CombatContext)!;
  const [activeStep, setActiveStep] = useState<number>(action.status === 'declared' ? 0 : 1);
  const [formData, setFormData] = useState<DeclareAttackDto>({
    attacks: [],
  });

  const onDeclare = () => {};

  return (
    <>
      <ResolveActionDialogMovementStepper
        formData={formData}
        setFormData={setFormData}
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        strategicGame={strategicGame as StrategicGame}
        game={game as TacticalGame}
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
