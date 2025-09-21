import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { useError } from '../../../ErrorContext';
import { fetchCharacters } from '../../api/characters';
import type { Character } from '../../api/characters';
import { fetchFactions } from '../../api/factions';
import type { Faction } from '../../api/factions';
import { fetchStrategicGame } from '../../api/strategic-games';
import type { StrategicGame } from '../../api/strategic-games';
import { fetchTacticalGame } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import TacticalGameAvatar from '../../shared/avatars/TacticalGameAvatar';
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

  const bindTacticalGame = async (gameId?: string) => {
    if (!gameId) return;
    fetchTacticalGame(gameId)
      .then((response) => {
        setTacticalGame(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError(String(err));
      });
  };

  const bindStrategicGame = (strategicGameId: string) => {
    fetchStrategicGame(strategicGameId)
      .then((response) => {
        setStrategicGame(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError(String(err));
      });
  };

  const bindCharacters = (factions: number[]) => {
    if (factions.length > 0) {
      fetchCharacters(`factionId=in=(${factions.join(',')})`, 0, 100)
        .then((response) => {
          setCharacters(response);
        })
        .catch((err: unknown) => {
          if (err instanceof Error) showError(err.message);
          else showError(String(err));
        });
    } else {
      setCharacters([]);
    }
  };

  const bindFactions = (strategicGameId: string) => {
    fetchFactions(`gameId==${strategicGameId}`, 0, 100)
      .then((response) => {
        setFactions(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError(String(err));
      });
  };

  useEffect(() => {
    if (location.state && location.state.tacticalGame) {
      setTacticalGame(location.state.tacticalGame);
    } else {
      bindTacticalGame(gameId);
    }
  }, [location.state, gameId]);

  useEffect(() => {
    if (tacticalGame && tacticalGame.strategicGameId) {
      bindStrategicGame(tacticalGame.strategicGameId);
      bindFactions(tacticalGame.strategicGameId);
    }
    if (tacticalGame && tacticalGame.factions) {
      bindCharacters(tacticalGame.factions);
    }
  }, [tacticalGame]);

  if (!tacticalGame) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <TacticalGameViewActions tacticalGame={tacticalGame} />
      <Grid container spacing={5}>
        <Grid size={2}>
          <TacticalGameAvatar tacticalGame={tacticalGame} size={300} />
          <TacticalGameViewResume tacticalGame={tacticalGame} strategicGame={strategicGame} />
          <TacticalGameViewFactions tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} />
        </Grid>
        <Grid size={10}>
          <TacticalGameViewActors tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} factions={factions} characters={characters} />
        </Grid>
      </Grid>
    </>
  );
};

export default TacticalGameView;
