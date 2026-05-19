import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import {
  AddButton,
  fetchTacticalGames,
  LayoutBase,
  RefreshButton,
  RmuPagination,
  RmuTextCard,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeCard } from '../../services/display';
import { defaultTacticalGameImage } from '../../services/image-service';
import TacticalGameListSearch from './TacticalGameListSearch';

export default function TacticalGameList() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const [queryString, setQueryString] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(24);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [games, setGames] = useState<TacticalGame[]>([]);

  const onTacticalGameClick = (tacticalGame: TacticalGame) => {
    navigate(`/tactical/games/view/${tacticalGame.id}`, { state: { tacticalGame: tacticalGame } });
  };

  const bindTacticalGames = () => {
    fetchTacticalGames(queryString, page, pageSize, auth)
      .then((response) => {
        setGames(response.content);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err) => showError(err.message));
  };

  const onNewTacticalGame = () => {
    navigate('/tactical/games/create');
  };

  useEffect(() => {
    bindTacticalGames();
  }, [queryString, page, pageSize]);

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games') },
      ]}
      actions={[
        <RefreshButton onClick={() => bindTacticalGames()} />,
        <AddButton onClick={() => onNewTacticalGame()} />,
      ]}
    >
      <TacticalGameListSearch setQueryString={setQueryString} />

      <Grid container spacing={1} sx={{ mt: 2 }}>
        {games.map((game, index) => (
          <Grid size={gridSizeCard} key={index}>
            <RmuTextCard
              value={game.name}
              subtitle={game.description || 'No description provided'}
              image={game.imageUrl || defaultTacticalGameImage}
              onClick={() => onTacticalGameClick(game)}
            />
          </Grid>
        ))}
      </Grid>
      {games.length === 0 && (
        <Typography variant="body1" color="secondary" sx={{ mt: 2 }}>
          <em>{t('no-data')}</em>
        </Typography>
      )}
      <RmuPagination
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        setPage={setPage}
        setPageSize={setPageSize}
      />
    </LayoutBase>
  );
}
