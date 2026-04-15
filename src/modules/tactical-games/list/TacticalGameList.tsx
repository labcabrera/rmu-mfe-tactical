/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from '@mui/material';
import { fetchTacticalGames, RmuPagination, RmuTextCard, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain, gridSizeCard } from '../../services/display';
import { defaultTacticalGameImage } from '../../services/image-service';
import TacticalGameListActions from './TacticalGameListActions';
import TacticalGameListSearch from './TacticalGameListSearch';
import TacticalGameResume from './TacticalGameResume';

const TacticalGameList: FC = () => {
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
    fetchTacticalGames(queryString, page, pageSize)
      .then((response) => {
        setGames(response.content);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    bindTacticalGames();
  }, [queryString, page, pageSize]);

  return (
    <>
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <TacticalGameResume />
        </Grid>
        <Grid size={gridSizeMain}>
          <TacticalGameListActions />
          <Grid container spacing={1}>
            <Grid size={12}>
              <TacticalGameListSearch setQueryString={setQueryString} />
            </Grid>
            <Grid size={12}>
              <Grid container spacing={1}>
                {games.map((game, index) => (
                  <Grid size={gridSizeCard} key={index}>
                    <RmuTextCard
                      value={game.name}
                      subtitle={game.description}
                      image={game.imageUrl || defaultTacticalGameImage}
                      onClick={() => onTacticalGameClick(game)}
                    />
                  </Grid>
                ))}
              </Grid>
              {games.length === 0 && <span>No games found.</span>}
            </Grid>
          </Grid>
          <Grid size={12}>
            <RmuPagination
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              setPage={setPage}
              setPageSize={setPageSize}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameList;
