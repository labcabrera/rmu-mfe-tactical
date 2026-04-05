import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CategorySeparator, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import { Character } from '../../api/characters.dto';
import type { Faction } from '../../api/factions';
import { addActor, deleteActor } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';

const TacticalGameViewActors: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
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
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
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
      const filteredCharacters = characters.filter((c) => c.faction.id === faction.id);
      setFactionCharacters(filteredCharacters);
    }
  }, [faction, characters]);

  if (factionCharacters.length === 0) return <p>No characters available for this faction.</p>;

  return (
    <>
      <CategorySeparator text={faction?.name} />
      <Grid container spacing={1}>
        {factionCharacters.map((character) => (
          <Grid size={3}>
            <TacticalGameViewActorsFactionItem
              key={character.id}
              tacticalGame={tacticalGame}
              setTacticalGame={setTacticalGame}
              character={character}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

const TacticalGameViewActorsFactionItem: FC<{
  character: Character;
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
}> = ({ character, tacticalGame, setTacticalGame }) => {
  const { showError } = useError();

  const isSelected = () => {
    return tacticalGame.actors.some((actor: { id: string }) => actor.id === character.id);
  };

  const handleToggle = (character: Character) => {
    const func = isSelected()
      ? deleteActor(tacticalGame.id, character.id)
      : addActor(tacticalGame.id, character.id, 'character');
    func
      .then((response) => {
        setTacticalGame(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  return (
    <RmuTextCard
      value={character.name}
      subtitle={`${character.info.race.name} - ${t(character.info.professionId)} - ${character.experience.availableLevel}`}
      image={character.imageUrl || ''}
      grayscale={!isSelected() ? 1 : 0}
      onClick={() => handleToggle(character)}
    />
  );
};

export default TacticalGameViewActors;
