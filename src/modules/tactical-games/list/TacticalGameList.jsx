/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Link from '@mui/material/Link';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGames } from '../../api/tactical-games';
import GameListItem from './../../shared/list-items/GameListItem';
import TacticalGameListActions from './TacticalGameListActions';

const TacticalGameList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [games, setGames] = useState([]);

  const fetchGames = () => {
    fetchTacticalGames('', 0, 20)
      .then((response) => {
        setGames(response);
      })
      .catch((err) => {
        showError(err.message);
      });
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
      {games.map((game, index) => (
        <GameListItem key={index} game={game} />
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
    </>
  );
};

export default TacticalGameList;
