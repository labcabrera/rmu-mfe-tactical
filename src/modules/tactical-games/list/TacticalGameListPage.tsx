import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  fetchTacticalGames,
  FilterBar,
  ListPage,
  RmuTextCard,
  rsqlAnd,
  SearchField,
  TacticalGame,
  useNotify,
  usePagedQuery,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { defaultTacticalGameImage } from '../../services/image-service';

export default function TacticalGameListPage() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const notify = useNotify();
  const [name, setName] = useState('');
  const query = usePagedQuery<TacticalGame>({
    fetcher: (q, page, size) => fetchTacticalGames(q, page, size, auth),
    rsql: rsqlAnd([['name=re=', name]]),
    onError: notify.error,
  });

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
        <FilterBar>
          <SearchField value={name} onChange={setName} />
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
