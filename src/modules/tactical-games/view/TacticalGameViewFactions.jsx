import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import { addFaction } from '../../api/tactical-games';

const TacticalGameViewFactions = ({ tacticalGame, setTacticalGame, factions }) => {
  const [tacticalCharacters, setTacticalCharacters] = useState([]);

  const isSelected = (factionId) => {
    return tacticalGame.factions.includes(factionId);
  };

  const handleFactionChange = (factionId) => {
    if (isSelected(factionId)) {
      //TODO
      setTacticalGame({
        ...tacticalGame,
        factions: tacticalGame.factions.filter((id) => id !== factionId),
      });
    } else {
      addFaction(tacticalGame.id, factionId).then((updatedGame) => {
        setTacticalGame(updatedGame);
      });
    }
  };

  useEffect(() => {}, []);

  if (!tacticalGame) {
    return <p>Loading game...</p>;
  }

  if (!factions) {
    return <p>Loading factions...</p>;
  }

  return (
    <>
      Factions
      <List sx={{ width: '100%' }}>
        {factions &&
          factions.map((faction) => (
            <FormControlLabel
              key={faction.id}
              control={<Checkbox checked={isSelected(faction.id)} onChange={() => handleFactionChange(faction.id)} />}
              label={faction.name}
            />
          ))}
      </List>
    </>
  );
};

export default TacticalGameViewFactions;
