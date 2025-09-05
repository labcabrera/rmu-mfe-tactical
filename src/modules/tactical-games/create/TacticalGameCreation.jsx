import React, { useEffect, useState } from 'react';
import { fetchStrategicGames } from '../../api/strategic-games';
import { createGameTemplate } from '../../data/tactical-game-data';
import TacticalGameCreationActions from './TacticalGameCreationActions';
import TacticalGameCreationAttributes from './TacticalGameCreationAttributes';

const TacticalGameCreation = () => {
  const [strategicGames, setStrategicGames] = useState([]);
  const [formData, setFormData] = useState(createGameTemplate);
  const [isValid, setIsValid] = useState(false);

  const validateForm = () => {
    if (!formData.name) return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  useEffect(() => {
    const bindStrategicGames = async () => {
      const games = await fetchStrategicGames('', 0, 100);
      setStrategicGames(games);
    };
    bindStrategicGames();
  }, []);

  useEffect(() => {
    setIsValid(validateForm());
  }, [formData]);

  return (
    <>
      <TacticalGameCreationActions formData={formData} isValid={isValid} />
      <TacticalGameCreationAttributes formData={formData} setFormData={setFormData} strategicGames={strategicGames} />
      {/* <pre>Form: {JSON.stringify(formData, null, 2)}</pre>
      <pre>Strategic Games: {JSON.stringify(strategicGames, null, 2)}</pre> */}
    </>
  );
};

export default TacticalGameCreation;
