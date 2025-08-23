import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchTacticalGames } from '../../api/tactical-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import TacticalGameListActions from './TacticalGameListActions';
import TacticalGameListItem from './TacticalGameListItem';

const TacticalGameList = () => {
  const { t } = useTranslation();
  const [games, setGames] = useState([]);
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchGames = async () => {
    try {
      const response = await fetchTacticalGames('', 0, 10);
      setGames(response);
    } catch (error) {
      setDisplayError(true);
      setErrorMessage(`Error loading games. ${error.message}`);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  return (
    <>
      <TacticalGameListActions />
      {games.map((game) => (
        <TacticalGameListItem tacticalGame={game} />
      ))}
      <SnackbarError displayError={displayError} errorMessage={errorMessage} setDisplayError={setDisplayError} />
    </>
  );
};

export default TacticalGameList;
