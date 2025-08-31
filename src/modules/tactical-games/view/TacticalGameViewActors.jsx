import React, { useEffect, useState } from 'react';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { addActor, deleteActor } from '../../api/tactical-games';
import CharacterAvatar from '../../shared/avatars/CharacterAvatar';

const TacticalGameViewActorsFactionItem = ({ character, tacticalGame, setTacticalGame }) => {
  const isSelected = () => {
    return tacticalGame.actors.some((actor) => actor.id === character.id);
  };
  const handleToggle = (e, id) => {
    console.log('Toggled:', id, 'Checked:', e.target.checked);
    const func = e.target.checked ? addActor(tacticalGame.id, character.id, 'character') : deleteActor(tacticalGame.id, character.id);
    func.then((response) => {
      setTacticalGame(response);
    });
  };

  return (
    <ListItem
      key={character.id}
      secondaryAction={<Checkbox edge="end" onChange={(e) => handleToggle(e, character.id)} checked={isSelected()} />}
      disablePadding
    >
      <ListItemAvatar>
        <CharacterAvatar character={character} />
      </ListItemAvatar>
      <ListItemText id={character.id} primary={character.name} secondary={character.info.race} />
    </ListItem>
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
      {/* <pre>Faction characters: {JSON.stringify(factionCharacters, null, 2)}</pre> */}
    </>
  );
};

const TacticalGameViewActors = ({ tacticalGame, setTacticalGame, factions, characters }) => {
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
          setTacticalGame={setTacticalGame}
          factions={factions}
          characters={characters}
        />
      ))}
    </>
  );
};

export default TacticalGameViewActors;
