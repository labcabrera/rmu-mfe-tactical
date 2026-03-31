import React, { FC, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Grid } from '@mui/material';
import { EditableAvatar } from '@labcabrera-rmu/rmu-react-shared-lib';
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
import { defaultTacticalGameImage, getAvatarImages } from '../../services/image-service';
import TechnicalInfo from '../../shared/display/TechnicalInfo';
import TacticalGameViewEnvironment from './TacticalGameEnvironment';
import TacticalGameViewActions from './TacticalGameViewActions';
import TacticalGameViewActors from './TacticalGameViewActors';
import TacticalGameViewFactions from './TacticalGameViewFactions';
import TacticalGameViewResume from './TacticalGameViewResume';

const TacticalGameView: FC = () => {
  const location = useLocation();
  const { gameId } = useParams<{ gameId?: string }>();
  const { showError } = useError();
  const [tacticalGame, setTacticalGame] = useState<TacticalGame>();
  const [strategicGame, setStrategicGame] = useState<StrategicGame>();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [factions, setFactions] = useState<Faction[]>([]);

  const updateImage = (imageUrl: string) => {
    showError('Not implemented ' + imageUrl);
  };

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
    </>
  );
};

export default TacticalGameView;
