/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Autocomplete, IconButton, Stack, TextField, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  fetchStrategicGames,
  fetchTacticalGames,
  FilterBar,
  ListPage,
  RmuTextCard,
  rsqlAnd,
  SearchField,
  StrategicGame,
  TacticalGame,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultTacticalGameImage } from '../../services/image-service';

type SortField = 'createdAt' | 'name';

export default function TacticalGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [name, setName] = useState('');
  const [strategicGameId, setStrategicGameId] = useState('');
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  // Newest first by default; the name sorts A-Z by default.
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [descending, setDescending] = useState(true);
  const query = usePagedQuery<TacticalGame>({
    fetcher: (q, page, size, sort) => fetchTacticalGames(q, page, size, auth, sort),
    rsql: rsqlAnd([
      ['name=re=', name],
      ['strategicGameId==', strategicGameId],
    ]),
    sort: `${descending ? '-' : ''}${sortField}`,
    onError: notify.error,
  });

  useEffect(() => {
    fetchStrategicGames('', 0, 100, auth)
      .then((response) => setStrategicGames(response.content))
      .catch(notify.error);
  }, []);

  const changeSortField = (field: SortField | null) => {
    if (!field) return;
    setSortField(field);
    setDescending(field === 'createdAt');
  };

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games') },
      ]}
      query={query}
      onAdd={() => navigate('/tactical/games/create')}
      filters={
        <FilterBar activeCount={strategicGameId ? 1 : 0}>
          <SearchField value={name} onChange={setName} />
          <Autocomplete
            options={strategicGames}
            getOptionLabel={(option) => option?.name || ''}
            value={strategicGames.find((option) => option.id === strategicGameId) || null}
            onChange={(_, newValue) => setStrategicGameId(newValue?.id || '')}
            isOptionEqualToValue={(option, val) => option.id === val.id}
            fullWidth
            renderInput={(params) => <TextField {...params} label={t('strategic-game')} />}
            noOptionsText={t('no-options')}
          />
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <ToggleButtonGroup
              value={sortField}
              exclusive
              size="small"
              onChange={(_, value: SortField | null) => changeSortField(value)}
              aria-label={t('sort-order')}
            >
              <ToggleButton value="name">{t('name')}</ToggleButton>
              <ToggleButton value="createdAt">{t('date')}</ToggleButton>
            </ToggleButtonGroup>
            <Tooltip title={descending ? t('sort-descending') : t('sort-ascending')}>
              <IconButton
                onClick={() => setDescending((value) => !value)}
                aria-label={descending ? t('sort-descending') : t('sort-ascending')}
              >
                {descending ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </FilterBar>
      }
      renderItem={(game) => (
        <RmuTextCard
          value={game.name}
          subtitle={game.description || t('no-description')}
          image={game.imageUrl || defaultTacticalGameImage}
          onClick={() => navigate(`/tactical/games/view/${game.id}`, { state: { tacticalGame: game } })}
        />
      )}
    />
  );
}
