import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchTacticalGames } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import GameListItem from '../../shared/list-items/GameListItem';
import TacticalGameListActions from './TacticalGameListActions';

const TacticalGameList: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [games, setGames] = useState<TacticalGame[]>([]);

  const fetchGames = () => {
    fetchTacticalGames('', 0, 20)
      .then((response) => {
        setGames(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const handleNewGame = () => {
    navigate('/tactical/games/create');
  };

  useEffect(() => {
    fetchGames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <TacticalGameListActions />
      {games.map((game) => (
        <GameListItem key={game.id} game={game} />
      ))}
      {games.length === 0 ? (
        <p>
          No games found.{' '}
          <Link component="button" onClick={handleNewGame}>
            {t('create-new')}
          </Link>
        </p>
      ) : null}
    </>
  );
};

export default TacticalGameList;
