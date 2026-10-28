/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import { Chip, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import {
  ClearableTextField,
  EntityCard,
  fetchStrategicGames,
  fetchTacticalGames,
  FilterBar,
  FilterSchema,
  gridSizeShowcase,
  ListPage,
  StrategicGame,
  StrategicGamePicker,
  TacticalGame,
  useListFilters,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultTacticalGameImage } from '../../services/image-service';

type SortField = 'createdAt' | 'name';

const STATUS_COLORS: Record<TacticalGame['status'], 'default' | 'success' | 'info'> = {
  created: 'default',
  in_progress: 'success',
  finished: 'info',
};

export default function TacticalGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [strategicGames, setStrategicGames] = useState<StrategicGame[]>([]);
  const gameNames = useMemo(() => new Map(strategicGames.map((game) => [game.id, game.name])), [strategicGames]);

  // Filters and sort live in the URL (spec 046). The sort is a control: no chip, kept by "clear".
  const schema: FilterSchema<TacticalGame> = {
    q: { kind: 'text', label: t('name'), toRsql: (value) => `name=re=${value}` },
    strategicGame: {
      kind: 'single',
      label: t('strategic-game'),
      format: (id) => gameNames.get(id) ?? id,
      toRsql: (value) => `strategicGameId==${value}`,
    },
    sort: {
      kind: 'single',
      label: t('sort-order'),
      options: ['createdAt', 'name'],
      defaultValue: 'createdAt',
      chip: false,
    },
    dir: { kind: 'single', label: t('sort-order'), options: ['asc', 'desc'], chip: false },
  };
  const filters = useListFilters(schema);
  const sortField = (filters.get('sort') || 'createdAt') as SortField;
  // Newest first by default; the name sorts A-Z by default.
  const descending = filters.get('dir') ? filters.get('dir') === 'desc' : sortField === 'createdAt';

  const query = usePagedQuery<TacticalGame>({
    fetcher: (q, page, size, sort) => fetchTacticalGames(q, page, size, auth, sort),
    rsql: filters.rsql,
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
    filters.set('sort', field);
    filters.clear('dir');
  };

  const sortControl = (
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
          onClick={() => filters.set('dir', descending ? 'asc' : 'desc')}
          aria-label={descending ? t('sort-descending') : t('sort-ascending')}
        >
          {descending ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <ListPage
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games') },
      ]}
      query={query}
      onAdd={() => navigate('/tactical/games/create')}
      filterState={filters}
      resultsActions={sortControl}
      collection={{ modes: ['cards'], storageKey: 'tactical.games', cardSize: gridSizeShowcase }}
      filters={
        <FilterBar>
          <ClearableTextField
            label={t('name')}
            name="search"
            value={filters.get('q')}
            onChange={(value) => filters.set('q', value ?? '')}
          />
          <StrategicGamePicker
            games={strategicGames}
            variant="select"
            allowAll
            value={filters.get('strategicGame') || null}
            onChange={(id) => filters.set('strategicGame', id)}
          />
        </FilterBar>
      }
      renderItem={(game) => (
        <EntityCard
          title={game.name}
          subtitle={gameNames.get(game.strategicGameId)}
          image={game.imageUrl || defaultTacticalGameImage}
          chips={
            <Chip size="small" color={STATUS_COLORS[game.status]} label={t(`tactical-game-status-${game.status}`)} />
          }
          metrics={game.round ? [{ label: t('round'), value: game.round }] : undefined}
          description={game.description || t('no-description')}
          onClick={() => navigate(`/tactical/games/view/${game.id}`, { state: { tacticalGame: game } })}
        />
      )}
    />
  );
}
