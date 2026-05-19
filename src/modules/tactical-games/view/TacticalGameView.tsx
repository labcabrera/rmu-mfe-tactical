/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  CancelButton,
  Character,
  DeleteButton,
  DeleteDialog,
  deleteTacticalGame,
  EditableAvatar,
  EditButton,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGame,
  LayoutBase,
  RefreshButton,
  startRound,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  updateTacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { defaultTacticalGameImage, getAvatarImages } from '../../services/image-service';
import PlayButton from '../../shared/buttons/PlayButton';
import TacticalGameViewEnvironment from './TacticalGameEnvironment';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewFactions from './TacticalGameViewFactions';
import TacticalGameViewResume from './TacticalGameViewResume';

const TacticalGameView: FC = () => {
  const auth = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId?: string }>();
  const { showError } = useError();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const updateImage = (imageUrl: string) => {
    if (!gameId || !imageUrl) return;
    const dto = { imageUrl };
    updateTacticalGame(gameId, dto, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err));
  };

  const onDelete = () => {
    deleteTacticalGame(tacticalGame!.id, auth)
      .then(() => {
        navigate('/tactical/games');
        setDeleteDialogOpen(false);
      })
      .catch((err) => showError(err.message));
  };

  const onEdit = () => {
    navigate(`/tactical/games/edit/${tacticalGame!.id}`, { state: { tacticalGame } });
  };

  const onPlay = async () => {
    if (tacticalGame!.status === 'created') {
      startRound(tacticalGame!.id, auth)
        .then((data) => navigate(`/tactical/combat/${data.id}`, { state: { tacticalGame: data } }))
        .catch((err) => showError(err.message));
    } else {
      navigate(`/tactical/combat/${tacticalGame!.id}`, { state: { tacticalGame } });
    }
  };

  const onRefresh = () => {
    fetchTacticalGame(tacticalGame!.id, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err.message));
  };

  useEffect(() => {
    if (factions && factions.length > 0) {
      const rsql = `faction.id=in=(${factions.map((faction) => faction.id).join(',')})`;
      fetchCharacters(rsql, 0, 100, auth)
        .then((response) => setCharacters(response.content))
        .catch((err) => showError(err.message));
    }
  }, [factions, showError]);

  useEffect(() => {
    if (tacticalGame) {
      fetchStrategicGame(tacticalGame.strategicGameId, auth)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
      fetchFactions(`gameId==${tacticalGame.strategicGameId}`, 0, 100, auth)
        .then((response) => setFactions(response.content))
        .catch((err) => showError(err.message));
    }
  }, [auth, showError, tacticalGame]);

  useEffect(() => {
    if (location.state && location.state.realm) {
      setTacticalGame(location.state.tacticalGame);
    } else if (gameId && auth) {
      fetchTacticalGame(gameId, auth)
        .then((response) => setTacticalGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId]);

  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <LayoutBase
      breadcrumbs={[
        { name: t('home'), link: '/' },
        { name: t('tactical-module'), link: '/tactical' },
        { name: t('tactical-games'), link: '/tactical/games' },
        { name: t('view') },
      ]}
      actions={[
        <CancelButton onClick={() => navigate('/tactical/games')} />,
        <PlayButton onClick={() => onPlay()} />,
        <RefreshButton onClick={() => onRefresh()} />,
        <EditButton onClick={() => onEdit()} />,
        <DeleteButton onClick={() => setDeleteDialogOpen(true)} />,
      ]}
      leftPanel={
        <>
          <EditableAvatar
            imageUrl={tacticalGame.imageUrl || defaultTacticalGameImage}
            images={getAvatarImages()}
            onImageChange={(imageUrl) => updateImage(imageUrl)}
          />
          <TacticalGameViewResume tacticalGame={tacticalGame} strategicGame={strategicGame} />
          <TacticalGameViewFactions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} />
          <TacticalGameViewEnvironment tacticalGame={tacticalGame} />
        </>
      }
    >
      <TacticalGameViewActors
        tacticalGame={tacticalGame}
        setTacticalGame={setTacticalGame}
        factions={factions}
        characters={characters}
      />
      <TechnicalInfo>
        <pre>TacticalGame: {JSON.stringify(tacticalGame, null, 2)}</pre>
      </TechnicalInfo>
      <DeleteDialog
        message={`Are you sure you want to delete ${tacticalGame.name} game? This action cannot be undone.`}
        onDelete={() => onDelete()}
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </LayoutBase>
  );
};

export default TacticalGameView;
