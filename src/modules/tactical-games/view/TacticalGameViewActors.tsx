import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Checkbox, List, ListItem, ListItemAvatar, ListItemButton, ListItemText, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import type { Character } from '../../api/characters';
import type { Faction } from '../../api/factions';
import { addActor, deleteActor } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';

type TacticalGameViewActorsProps = {
  tacticalGame: TacticalGame;
  setTacticalGame: (game: TacticalGame) => void;
  factions: Faction[];
  characters: Character[];
};

type TacticalGameViewActorsFactionProps = {
  factionId: string;
  factions: Faction[];
  tacticalGame: TacticalGame;
  setTacticalGame: (game: TacticalGame) => void;
  characters: Character[];
};

type TacticalGameViewActorsFactionItemProps = {
  character: Character;
  tacticalGame: TacticalGame;
  setTacticalGame: (game: TacticalGame) => void;
};

const TacticalGameViewActorsFactionItem: FC<TacticalGameViewActorsFactionItemProps> = ({ character, tacticalGame, setTacticalGame }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showError } = useError();

  const isSelected = () => {
    return tacticalGame.actors.some((actor: { id: string }) => actor.id === character.id);
  };

  const getCharacterResume = () => {
    return `${t(character.info.raceId)} - ${t(character.info.professionId)} - Lvl ${character.experience.availableLevel}`;
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const func = e.target.checked ? addActor(tacticalGame.id, character.id, 'character') : deleteActor(tacticalGame.id, character.id);
    func
      .then((response) => {
        setTacticalGame(response);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  const handleNavigate = () => {
    navigate(`/strategic/characters/view/${character.id}`);
  };

  return (
    <ListItem key={character.id} secondaryAction={<Checkbox edge="end" onChange={handleToggle} checked={isSelected()} />} disablePadding>
      <ListItemButton onClick={handleNavigate}>
        <ListItemAvatar sx={{ mr: 2 }}>
          <CharacterAvatar character={character} />
        </ListItemAvatar>
        <ListItemText id={String(character.id)} primary={character.name} secondary={getCharacterResume()} />
      </ListItemButton>
    </ListItem>
  );
};

const TacticalGameViewActorsFaction: FC<TacticalGameViewActorsFactionProps> = ({
  factionId,
  factions,
  tacticalGame,
  setTacticalGame,
  characters,
}) => {
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
      <Typography variant="h6">{faction?.name}</Typography>
      <List dense>
        {factionCharacters.map((character) => (
          <TacticalGameViewActorsFactionItem key={character.id} tacticalGame={tacticalGame} setTacticalGame={setTacticalGame} character={character} />
        ))}
      </List>
    </>
  );
};

const TacticalGameViewActors: React.FC<TacticalGameViewActorsProps> = ({ tacticalGame, setTacticalGame, factions, characters }) => {
  const { t } = useTranslation();

  if (!tacticalGame || !factions || !characters) {
    return <p>Loading...</p>;
  }

  if (tacticalGame.factions.length < 1) {
    return <p>No available characters</p>;
  }

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('import-actors')}
      </Typography>
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

export default TacticalGameViewActors;
