/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import {
  Character,
  EditableAvatar,
  Faction,
  fetchCharacters,
  fetchFactions,
  fetchStrategicGame,
  fetchTacticalGame,
  StrategicGame,
  TacticalGame,
  TechnicalInfo,
  updateTacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import { defaultTacticalGameImage, getAvatarImages } from '../../services/image-service';
import TacticalGameViewEnvironment from './TacticalGameEnvironment';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewFactions from './TacticalGameViewFactions';
import TacticalGameViewResume from './TacticalGameViewResume';

const TacticalGameView: FC = () => {
  const auth = useAuth();
  const location = useLocation();
  const { gameId } = useParams<{ gameId?: string }>();
  const { showError } = useError();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

  const updateImage = (imageUrl: string) => {
    if (!gameId || !imageUrl) return;
    const dto = { imageUrl };
    updateTacticalGame(gameId, dto, auth)
      .then((response) => setTacticalGame(response))
      .catch((err) => showError(err));
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
    <Grid container spacing={1}>
      <Grid size={gridSizeResume}>
        <EditableAvatar
          imageUrl={tacticalGame.imageUrl || defaultTacticalGameImage}
          images={getAvatarImages()}
          onImageChange={(imageUrl) => updateImage(imageUrl)}
        />
        <TacticalGameViewResume tacticalGame={tacticalGame} strategicGame={strategicGame} />
        <TacticalGameViewFactions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} />
        <TacticalGameViewEnvironment tacticalGame={tacticalGame} />
      </Grid>
      <Grid size={gridSizeMain}>
        <TacticalGameViewActions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} />
        <TacticalGameViewActors
          tacticalGame={tacticalGame}
          setTacticalGame={setTacticalGame}
          factions={factions}
          characters={characters}
        />
      </Grid>
      <Grid size={12}>
        <TechnicalInfo>
          <pre>TacticalGame: {JSON.stringify(tacticalGame, null, 2)}</pre>
        </TechnicalInfo>
      </Grid>
    </Grid>
  );
};

export default TacticalGameView;
