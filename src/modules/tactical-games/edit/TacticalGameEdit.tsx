import React, { FC, useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { TacticalGame, UpdateTacticalGameDto } from '../../api/tactical-games';
import TacticalGameEditActions from './TacticalGameEditActions';
import TacticalGameEditAttributes from './TacticalGameEditAttributes';

const TacticalGameEdit: FC = () => {
  const location = useLocation();
  const tacticalGame = (location.state as { tacticalGame?: TacticalGame })?.tacticalGame;

  const [formData, setFormData] = useState<UpdateTacticalGameDto>({
    name: tacticalGame?.name || '',
    description: tacticalGame?.description || '',
  });

  if (!tacticalGame) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TacticalGameEditActions tacticalGame={tacticalGame} formData={formData} />
      <TacticalGameEditAttributes formData={formData} setFormData={setFormData} />
    </>
  );
};

export default TacticalGameEdit;
