import React, { use, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';

const TacticalGameViewActorsFactionItem = ({ character }) => {
  const isChecked = () => {
    return true;
  };
  const handleToggle = (id) => {
    // Handle toggle logic here
  };

  return (
    <ListItem key={character.id} secondaryAction={<Checkbox edge="end" onChange={handleToggle(character.id)} checked={isChecked()} />} disablePadding>
      {/* <ListItemButton> */}
      <ListItemAvatar>
        <CharacterAvatar character={character} />
      </ListItemAvatar>
      <ListItemText id={character.id} primary={character.name} secondary={character.info.race} />
      {/* </ListItemButton> */}
    </ListItem>
  );
};

const TacticalGameViewActorsFaction = ({ factionId, factions, tacticalGame, characters }) => {
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
          <TacticalGameViewActorsFactionItem key={character.id} character={character} />
        ))}
      </List>
      {/* <pre>Faction characters: {JSON.stringify(factionCharacters, null, 2)}</pre> */}
    </>
  );
};

const TacticalGameViewActors = ({ tacticalGame, factions, characters }) => {
  if (!tacticalGame || !factions || !characters) {
    return <p>Loading...</p>;
  }

  if (tacticalGame.factions.length < 1) {
    return <p>No available characters</p>;
  }

  return (
    <>
      IMPORT ACTORS
      {tacticalGame.factions.map((factionId) => (
        <TacticalGameViewActorsFaction
          key={factionId}
          factionId={factionId}
          tacticalGame={tacticalGame}
          factions={factions}
          characters={characters}
        />
      ))}
    </>
  );
};

export default TacticalGameViewActors;
