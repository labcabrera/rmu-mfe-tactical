import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { addFaction, deleteFaction } from '../../api/tactical-games';

const TacticalGameViewFactions = ({ tacticalGame, setTacticalGame, factions }) => {
  const [tacticalCharacters, setTacticalCharacters] = useState([]);

  const isSelected = (factionId) => {
    return tacticalGame.factions.includes(factionId);
  };

  const handleFactionChange = (e, factionId) => {
    const isSelected = !e.target.checked;
    const func = isSelected ? deleteFaction : addFaction;
    console.log('func:', func);
    func(tacticalGame.id, factionId)
      .then((updatedGame) => {
        setTacticalGame(updatedGame);
      })
      .catch((error) => {
        console.error('Error updating factions:', error);
      });
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
      <Typography variant="h6" color="primary">
        Factions
      </Typography>
      <List sx={{ width: '100%' }}>
        {factions &&
          factions.map((faction) => (
            <FormControlLabel
              key={faction.id}
              control={<Checkbox checked={isSelected(faction.id)} onChange={(e) => handleFactionChange(e, faction.id)} />}
              label={faction.name}
            />
          ))}
      </List>
    </>
  );
};

export default TacticalGameViewFactions;
