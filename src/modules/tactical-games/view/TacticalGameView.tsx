import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/characters';
import { Character } from '../../api/characters.dto';
import { fetchFactions } from '../../api/factions';
import type { Faction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import type { StrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';
import { gridSizeResume, gridSizeMain } from '../../services/display';
import TacticalGameAvatar from '../../shared/avatars/TacticalGameAvatar';
import TacticalGameViewEnvironment from './TacticalGameEnvironment';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewFactions from './TacticalGameViewFactions';
import TacticalGameViewResume from './TacticalGameViewResume';

const TacticalGameView: FC = () => {
  const location = useLocation();
  const { gameId } = useParams<{ gameId?: string }>();
  const { showError } = useError();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame | null>(null);
  const [strategicGame, setStrategicGame] = useState<StrategicGame | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

  useEffect(() => {
    if (factions && factions.length > 0) {
      fetchCharacters(`faction.id=in=(${factions.map((faction) => faction.id).join(',')})`, 0, 100)
        .then((response) => setCharacters(response))
        .catch((err) => showError(err.message));
    }
  }, [factions, showError]);

  useEffect(() => {
    if (tacticalGame) {
      fetchStrategicGame(tacticalGame.strategicGameId)
        .then((data) => setStrategicGame(data))
        .catch((err) => showError(err.message));
      fetchFactions(`gameId==${tacticalGame.strategicGameId}`, 0, 100)
        .then((response) => setFactions(response))
        .catch((err) => showError(err.message));
    }
  }, [tacticalGame, showError]);

  useEffect(() => {
    if (location.state && location.state.realm) {
      setTacticalGame(location.state.tacticalGame);
    } else if (gameId) {
      fetchTacticalGame(gameId)
        .then((response) => setTacticalGame(response))
        .catch((err) => showError(err.message));
    }
  }, [location.state, gameId, showError]);

  if (!tacticalGame) return <p>Loading...</p>;

  return (
    <>
      <TacticalGameViewActions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} />
      <Grid container spacing={1}>
        <Grid size={gridSizeResume}>
          <TacticalGameAvatar tacticalGame={tacticalGame} size={300} />
          <TacticalGameViewResume tacticalGame={tacticalGame} strategicGame={strategicGame} />
          <TacticalGameViewFactions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} />
          <TacticalGameViewEnvironment tacticalGame={tacticalGame} />
        </Grid>
        <Grid size={gridSizeMain}>
          <TacticalGameViewActors
            tacticalGame={tacticalGame}
            setTacticalGame={setTacticalGame}
            factions={factions}
            characters={characters}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameView;
