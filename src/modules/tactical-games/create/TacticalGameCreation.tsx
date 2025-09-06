import React, { FC, useEffect, useState } from 'react';
import { useError } from '../../../ErrorContext';
import { fetchStrategicGames } from '../../api/strategic-games';
import type { StrategicGame } from '../../api/strategic-games';
import { CreateTacticalGameDto } from '../../api/tactical-games';
import { createGameTemplate } from '../../data/tactical-game-data';
import TacticalGameCreationActions from './TacticalGameCreationActions';
import TacticalGameCreationAttributes from './TacticalGameCreationAttributes';

const TacticalGameCreation: FC = () => {
  const { showError } = useError();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const [formData, setFormData] = useState<CreateTacticalGameDto>({ ...createGameTemplate });
  const [isValid, setIsValid] = useState(false);

  const validateForm = () => {
    if (!formData.name) return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  const bindStrategicGames = async () => {
    fetchStrategicGames('', 0, 20)
      .then((response) => {
        setStrategicGames(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('Unknown error occurred');
      });
  };

  useEffect(() => {
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
