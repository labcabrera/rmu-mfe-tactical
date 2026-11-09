/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createTacticalGame,
  CreateTacticalGameDto,
  EntityImage,
  ErrorState,
  fetchStrategicGame,
  fetchTacticalGame,
  FormPage,
  LoadingState,
  NotFound,
  TacticalGame,
  updateTacticalGame,
  useApiNotify,
  useEntity,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { defaultImage } from '../../services/image-service';
import TacticalGameForm from './TacticalGameForm';

const DEFAULT_IMAGE = 'images/generic/tactical.png';

const EMPTY_GAME_TEMPLATE = {
  strategicGameId: '',
  name: '',
  actors: [],
  environment: {
    temperatureFatigueModifier: 0,
    altitudeFatigueModifier: 0,
  },
  description: '',
  imageUrl: DEFAULT_IMAGE,
} as unknown as TacticalGame;

/**
 * Create and edit page of a tactical game. Creation takes the strategic game from `?strategicGame=<id>`. Factions, NPCs
 * and environment are set once the game exists, in its view.
 */
export default function TacticalGameFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useApiNotify();
  const [searchParams] = useSearchParams();
  const { gameId } = useParams<{ gameId?: string }>();
  const existing = useEntity<TacticalGame>(mode === 'edit' ? gameId : undefined, (id) => fetchTacticalGame(id, auth), {
    initial: mode === 'edit' ? location.state?.tacticalGame : undefined,
    onError: notify.error,
  });
  const strategicGameId = mode === 'create' ? searchParams.get('strategicGame') : existing.entity?.strategicGameId;
  const strategicGameQuery = useQuery({
    queryKey: ['tactical-game-form', 'strategic-game', strategicGameId],
    queryFn: () => fetchStrategicGame(strategicGameId as string, auth),
    enabled: !!strategicGameId,
    gcTime: 0,
  });
  const strategicGame = strategicGameQuery.data;
  const [formData, setFormData] = useState<TacticalGame>();
  const [initialData, setInitialData] = useState<string>();

  const resetForm = (data: TacticalGame) => {
    setFormData(data);
    setInitialData(JSON.stringify(data));
  };

  useEffect(() => {
    if (mode === 'create') resetForm(EMPTY_GAME_TEMPLATE);
  }, [mode]);

  useEffect(() => {
    if (mode === 'edit' && existing.entity && !formData) resetForm(existing.entity);
  }, [existing.entity]);

  useEffect(() => {
    // Creation inherits the strategic game and its image: not a user change.
    if (mode === 'create' && strategicGame) {
      resetForm({
        ...EMPTY_GAME_TEMPLATE,
        strategicGameId: strategicGame.id,
        imageUrl: strategicGame.imageUrl || DEFAULT_IMAGE,
      });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (strategicGameQuery.error) notify.error(strategicGameQuery.error);
  }, [strategicGameQuery.error]);

  const isValid = !!formData?.name && (mode === 'edit' || !!formData.strategicGameId);

  const onSave = () => {
    if (!formData) return;
    if (mode === 'create') {
      createTacticalGame(formData as unknown as CreateTacticalGameDto, auth)
        .then((game) => navigate(`/tactical/games/view/${game.id}`))
        .catch(notify.error);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, strategicGameId, status, round, phase, factions, actors, owner, environmentFaction, ...dto } = formData;
    updateTacticalGame(gameId!, dto, auth)
      .then((data) => navigate(`/tactical/games/view/${gameId}`, { state: { tacticalGame: data } }))
      .catch(notify.error);
  };

  const onCancel = () => {
    if (mode === 'create') navigate('/tactical/games');
    else navigate(`/tactical/games/view/${gameId}`, { state: { tacticalGame: existing.entity } });
  };

  const breadcrumbs = [
    { name: t('home'), link: '/' },
    { name: t('tactical-module'), link: '/tactical' },
    { name: t('tactical-games'), link: '/tactical/games' },
    { name: t(mode === 'create' ? 'create' : 'edit') },
  ];

  return (
    <FormPage
      breadcrumbs={breadcrumbs}
      onSave={onSave}
      onCancel={onCancel}
      saveDisabled={!isValid}
      dirty={!!formData && JSON.stringify(formData) !== initialData}
      leftPanel={
        formData && (
          <EntityImage
            image={formData.imageUrl || (mode === 'create' ? DEFAULT_IMAGE : defaultImage)}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        )
      }
    >
      {formData ? (
        <TacticalGameForm mode={mode} formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
      ) : existing.notFound ? (
        <NotFound />
      ) : existing.error ? (
        <ErrorState error={existing.error} onRetry={existing.refresh} />
      ) : (
        <LoadingState variant="detail" />
      )}
    </FormPage>
  );
}
