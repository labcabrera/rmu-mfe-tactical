import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { fetchTacticalGames } from '../../api/tactical-games';
import SnackbarError from '../../shared/errors/SnackbarError';
import TacticalGameListActions from './TacticalGameListActions';
import TacticalGameListItem from './TacticalGameListItem';

const TacticalGameList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const handleNewGame = async () => {
    navigate('/tactical/games/create');
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
      {games.length === 0 ? (
        <>
          <p>
            No games found.{' '}
            <Link component="button" onClick={handleNewGame}>
              {t('create-new')}
            </Link>
          </p>
        </>
      ) : null}
      <SnackbarError displayError={displayError} errorMessage={errorMessage} setDisplayError={setDisplayError} />
    </>
  );
};

export default TacticalGameList;
