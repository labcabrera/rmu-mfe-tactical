/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createTacticalGame,
  CreateTacticalGameDto,
  EditableAvatar,
  fetchStrategicGame,
  fetchTacticalGame,
  ErrorState,
  FormPage,
  LoadingState,
  NotFound,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  updateTacticalGame,
  useEntity,
  useNotify,
} from '@labcabrera-rmu/rmu-react-shared-lib';
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

/** Create and edit page of a tactical game. Creation takes the strategic game from `?strategicGame=<id>`. */
export default function TacticalGameFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const [searchParams] = useSearchParams();
  const { gameId } = useParams<{ gameId?: string }>();
  const existing = useEntity<TacticalGame>(mode === 'edit' ? gameId : undefined, (id) => fetchTacticalGame(id, auth), {
    initial: mode === 'edit' ? location.state?.tacticalGame : undefined,
    onError: notify.error,
  });
  const strategicGameId = mode === 'create' ? searchParams.get('strategicGame') : existing.entity?.strategicGameId;
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
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
    if (!strategicGameId) return;
    fetchStrategicGame(strategicGameId, auth)
      .then((response) => {
        setStrategicGame(response);
        // Creation inherits the strategic game and its image: not a user change.
        if (mode === 'create') {
          resetForm({
            ...EMPTY_GAME_TEMPLATE,
            strategicGameId: response.id,
            imageUrl: response.imageUrl || DEFAULT_IMAGE,
          });
        }
      })
      .catch(notify.error);
  }, [strategicGameId]);

  const isValid = !!formData?.name && (mode === 'edit' || !!formData.strategicGameId);

  const onSave = () => {
    if (!formData) return;
    if (mode === 'create') {
      createTacticalGame(formData as unknown as CreateTacticalGameDto, auth)
        .then((game) => navigate(`/tactical/games/view/${game.id}`))
        .catch(notify.error);
      return;
    }
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const { id, strategicGameId, status, round, phase, factions, actors, owner, ...dto } = formData;
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
          <EditableAvatar
            imageUrl={formData.imageUrl || (mode === 'create' ? DEFAULT_IMAGE : defaultImage)}
            onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl })}
          />
        )
      }
    >
      {formData ? (
        <>
          <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
          <TechnicalInfo>
            <pre>{JSON.stringify(mode === 'create' ? { formData, strategicGame } : { formData }, null, 2)}</pre>
          </TechnicalInfo>
        </>
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
