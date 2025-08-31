import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { addActor, deleteActor } from '../../api/tactical-games';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';
import SnackbarError from '../../shared/errors/SnackbarError';

const TacticalGameViewActorsFactionItem = ({ character, tacticalGame, setTacticalGame }) => {
  const { t } = useTranslation();
  const [displayError, setDisplayError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const isSelected = () => {
    return tacticalGame.actors.some((actor) => actor.id === character.id);
  };
  const getCharacterResume = () => {
    return `${t(character.info.race)} - ${t(character.info.professionId)} - Lvl ${character.experience.availableLevel}`;
  };
  const handleToggle = (e, id) => {
    const func = e.target.checked ? addActor(tacticalGame.id, character.id, 'character') : deleteActor(tacticalGame.id, character.id);
    func
      .then((response) => {
        setTacticalGame(response);
      })
      .catch((err) => {
        setDisplayError(true);
        setErrorMessage('Error updating actor ' + err);
      });
  };

  return (
    <>
      <ListItem
        key={character.id}
        secondaryAction={<Checkbox edge="end" onChange={(e) => handleToggle(e, character.id)} checked={isSelected()} />}
        disablePadding
      >
        <ListItemAvatar>
          <CharacterAvatar character={character} />
        </ListItemAvatar>
        <ListItemText id={character.id} primary={character.name} secondary={getCharacterResume()} />
      </ListItem>
      <SnackbarError errorMessage={errorMessage} displayError={displayError} setDisplayError={setDisplayError} />
    </>
  );
};

const TacticalGameViewActorsFaction = ({ factionId, factions, tacticalGame, setTacticalGame, characters }) => {
  const [faction, setFaction] = useState(null);
  const [factionCharacters, setFactionCharacters] = useState([]);

  useEffect(() => {
    console.log('TacticalGameViewActorsFaction.useEffect: Faction ID:', factionId, 'Factions:', factions);
    if (factionId && factions) {
      const foundFaction = factions.find((f) => f.id === factionId);
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

const TacticalGameViewActors = ({ tacticalGame, setTacticalGame, factions, characters }) => {
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
      {tacticalGame.factions.map((factionId) => (
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
