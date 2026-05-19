import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import {
  CancelButton,
  createTacticalGame,
  CreateTacticalGameDto,
  EditableAvatar,
  fetchStrategicGame,
  LayoutBase,
  SaveButton,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  UpdateTacticalGameDto,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { imageBaseUrl } from '../../services/config';
import { getAvatarImages } from '../../services/image-service';
import TacticalGameForm from '../shared/TacticalGameForm';

const EMPTY_GAME_TEMPLATE = {
  strategicGameId: '',
  name: '',
  actors: [],
  environment: {
    temperatureFatigueModifier: 0,
    altitudeFatigueModifier: 0,
  },
  description: '',
  imageUrl: `${imageBaseUrl}images/generic/tactical.png`,
} as unknown as TacticalGame;

export default function TacticalGameCreation() {
  const auth = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();
  const params = new URLSearchParams(window.location.search);
  const strategicGameId = params.get('strategicGame');
  const [formData, setFormData] = useState<TacticalGame>(EMPTY_GAME_TEMPLATE);
  const [isValid, setIsValid] = useState(false);
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();

  const validateForm = (formData: CreateTacticalGameDto) => {
    if (!formData.name || formData.name === '') return false;
    if (!formData.strategicGameId) return false;
    return true;
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId, auth)
      .then((response) => setStrategicGame(response))
      .catch((err) => showError(err.message));
  };

  const onSave = async () => {
    const dto: UpdateTacticalGameDto = { ...formData };
    createTacticalGame(dto, auth)
      .then((game) => navigate(`/tactical/games/view/${game.id}`))
      .catch((err) => showError(err.message));
  };

  const onCancel = () => {
    navigate(`/tactical/games`);
  };

  useEffect(() => {
    if (formData) {
      setIsValid(validateForm(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (strategicGame) {
      const imageUrl = strategicGame.imageUrl || `${imageBaseUrl}images/generic/tactical.png`;
      setFormData({ ...formData!, strategicGameId: strategicGame.id, imageUrl: imageUrl });
    }
  }, [strategicGame]);

  useEffect(() => {
    if (strategicGameId) {
      bindStrategicGame(strategicGameId);
    }
  }, [strategicGameId]);

  if (!formData) return <p>Loading...</p>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games'), link: '/tactical/games' },
        { name: t('create') },
      ]}
      actions={[
        <CancelButton onClick={() => onCancel()} />,
        <SaveButton onClick={() => onSave()} disabled={!isValid} />,
      ]}
      leftPanel={
        <EditableAvatar
          imageUrl={formData.imageUrl || `${imageBaseUrl}images/generic/tactical.png`}
          images={getAvatarImages()}
          onImageChange={(imageUrl) => setFormData({ ...formData, imageUrl: imageUrl })}
        />
      }
    >
      <TacticalGameForm formData={formData} setFormData={setFormData} strategicGame={strategicGame} />
      <TechnicalInfo>
        <pre>FormData: {JSON.stringify(formData, null, 2)}</pre>
        <pre>StrategicGame: {JSON.stringify(strategicGame, null, 2)}</pre>
      </TechnicalInfo>
    </LayoutBase>
  );
}
