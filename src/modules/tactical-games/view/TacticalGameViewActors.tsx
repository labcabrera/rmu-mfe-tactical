import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import type { Character } from '../../api/characters';
import type { Faction } from '../../api/factions';
import { addActor, deleteActor } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import CharacterCard from '../../shared/cards/CharacterCard';

const TacticalGameViewActors: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame>>;
  factions: Faction[];
  characters: Character[];
}> = ({ tacticalGame, setTacticalGame, factions, characters }) => {
  if (!tacticalGame || !factions || !characters) return <p>Loading...</p>;
  if (tacticalGame.factions.length < 1) return <p>Select at least one faction to import actors.</p>;

  return (
    <>
      {tacticalGame.factions.map((factionId: string) => (
        <TacticalGameViewActorsFaction
          key={factionId}
          factionId={factionId}
          tacticalGame={tacticalGame}
          setTacticalGame={setTacticalGame}
          factions={factions}
          characters={characters}
        />
      ))}
    </>
  );
};

const TacticalGameViewActorsFaction: FC<{
  factionId: string;
  factions: Faction[];
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame>>;
  characters: Character[];
}> = ({ factionId, factions, tacticalGame, setTacticalGame, characters }) => {
  const [faction, setFaction] = useState<Faction | null>(null);
  const [factionCharacters, setFactionCharacters] = useState<Character[]>([]);

  useEffect(() => {
    if (factionId && factions) {
      const foundFaction = factions.find((f) => f.id === factionId) || null;
      setFaction(foundFaction);
    }
  }, [factionId, factions]);

  useEffect(() => {
    if (faction && characters) {
      const filteredCharacters = characters.filter((c) => c.factionId === faction.id);
      setFactionCharacters(filteredCharacters);
    }
  }, [faction, characters]);

  return (
    <>
      <Typography variant="h6" color="primary">
        {faction?.name}
      </Typography>
      {factionCharacters.length === 0 ? (
        <p>No characters available for this faction.</p>
      ) : (
        <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
          {factionCharacters.map((character) => (
            <TacticalGameViewActorsFactionItem
              key={character.id}
              tacticalGame={tacticalGame}
              setTacticalGame={setTacticalGame}
              character={character}
            />
          ))}
        </Box>
      )}
    </>
  );
};

const TacticalGameViewActorsFactionItem: FC<{
  character: Character;
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame>>;
}> = ({ character, tacticalGame, setTacticalGame }) => {
  const { showError } = useError();

  const isSelected = () => {
    return tacticalGame.actors.some((actor: { id: string }) => actor.id === character.id);
  };

  const handleToggle = (character) => {
    const func = isSelected() ? deleteActor(tacticalGame.id, character.id) : addActor(tacticalGame.id, character.id, 'character');
    func
      .then((response) => {
        setTacticalGame(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  return <CharacterCard character={character} disabled={!isSelected()} onClick={() => handleToggle(character)} />;
};

export default TacticalGameViewActors;
