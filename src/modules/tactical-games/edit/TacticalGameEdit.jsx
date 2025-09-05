import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import TacticalGameEditActions from './TacticalGameEditActions';
import TacticalGameEditAttributes from './TacticalGameEditAttributes';

const TacticalGameEdit = () => {
  const location = useLocation();
  const tacticalGame = location.state?.tacticalGame;
  const [formData, setFormData] = useState({
    name: tacticalGame.name,
    description: tacticalGame.description || '',
  });

  if (!tacticalGame) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <TacticalGameEditActions tacticalGame={tacticalGame} formData={formData} />
      <TacticalGameEditAttributes formData={formData} setFormData={setFormData} />
      {/* <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
      <pre>TacticalGame: {JSON.stringify(tacticalGame, null, 2)}</pre> */}
    </>
  );
};

export default TacticalGameEdit;
