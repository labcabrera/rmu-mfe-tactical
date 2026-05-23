import React, { Dispatch, FC, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid } from '@mui/material';
import {
  addActor,
  Character,
  deleteActor,
  Faction,
  RmuTextCard,
  Section,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';

const TacticalGameViewActors: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
  factions: Faction[];
  characters: Character[];
}> = ({ tacticalGame, setTacticalGame, factions, characters }) => {
  const { t } = useTranslation();

  if (!tacticalGame || !factions || !characters) return <p>Loading...</p>;
  if (tacticalGame.factions.length < 1) return <p>{t('select-at-least-one-faction')}</p>;

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
    <Section title={faction?.name || '...'}>
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
    </Section>
  );
};

const TacticalGameViewActorsFactionItem: FC<{
  character: Character;
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
}> = ({ character, tacticalGame, setTacticalGame }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();

  const isSelected = () => {
    return tacticalGame.actors.some((actor: { id: string }) => actor.id === character.id);
  };

  const handleToggle = (character: Character) => {
    const func = isSelected()
      ? deleteActor(tacticalGame.id, character.id, auth)
      : addActor(tacticalGame.id, character.id, 'character', auth);
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
