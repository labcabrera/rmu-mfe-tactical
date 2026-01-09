import React, { Dispatch, FC, SetStateAction } from 'react';
import { Box, Typography } from '@mui/material';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import type { Faction } from '../../api/factions';
import { addFaction, deleteFaction } from '../../api/tactical-games';
import type { TacticalGame } from '../../api/tactical-games';
import { defaultFactionImage } from '../../services/image-service';
import ImageCard from '../../shared/cards/ImageCard';

const TacticalGameViewFactions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame>>;
  factions: Faction[];
}> = ({ tacticalGame, setTacticalGame, factions }) => {
  const { showError } = useError();

  const isSelected = (factionId: string) => {
    return tacticalGame.factions.includes(factionId);
  };

  const handleFactionChange = (factionId: string) => {
    const checked = isSelected(factionId);
    const func = checked ? deleteFaction : addFaction;
    func(tacticalGame.id, factionId)
      .then((updatedGame) => {
        setTacticalGame(updatedGame);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) showError(err.message);
        else showError('An unknown error occurred');
      });
  };

  if (!tacticalGame) return <p>Loading game...</p>;

  if (!factions) return <p>Loading factions...</p>;

  return (
    <>
      <Typography variant="h6" color="primary">
        {t('factions')}
      </Typography>
      <Box mb={2} display="flex" flexDirection="row" flexWrap="wrap" gap={2}>
        {factions.map((faction) => (
          <ImageCard
            key={faction.id}
            image={faction.imageUrl ? faction.imageUrl : defaultFactionImage}
            disabled={!isSelected(faction.id)}
            onClick={() => handleFactionChange(faction.id)}
          >
            <Typography component="div" variant="subtitle1">
              {faction.name}
            </Typography>
            <Typography component="div" variant="caption" color="text.secondary">
              {faction.shortDescription}
            </Typography>
          </ImageCard>
        ))}
      </Box>
    </>
  );
};

export default TacticalGameViewFactions;
