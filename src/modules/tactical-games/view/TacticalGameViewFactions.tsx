import React, { Dispatch, FC, SetStateAction } from 'react';
import { Checkbox, FormControlLabel, List, Typography } from '@mui/material';
import { useError } from '../../../ErrorContext';
import type { Faction } from '../../api/factions';
import { addFaction, deleteFaction } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';

const TacticalGameViewFactions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame>>;
  factions: Faction[];
}> = ({ tacticalGame, setTacticalGame, factions }) => {
  const { showError } = useError();

  const isSelected = (factionId: string) => {
    return tacticalGame.factions.includes(factionId);
  };

  const handleFactionChange = (e: React.ChangeEvent<HTMLInputElement>, factionId: string) => {
    const checked = e.target.checked;
    const func = checked ? addFaction : deleteFaction;
    func(tacticalGame.id, factionId)
      .then((updatedGame) => {
        setTacticalGame(updatedGame);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

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
        {factions.map((faction) => (
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
