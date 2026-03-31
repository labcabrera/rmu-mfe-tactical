import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import { CategorySeparator, RmuTextCard } from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import type { Faction } from '../../api/factions';
import { addFaction, deleteFaction } from '../../api/tactical-game';
import { TacticalGame } from '../../api/tactical-game.dto';
import { defaultFactionImage } from '../../services/image-service';

const TacticalGameViewFactions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
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
      <CategorySeparator text={t('factions')} />
      <Grid container spacing={1}>
        {factions.map((faction, index) => (
          <Grid size={12}>
            <RmuTextCard
              key={index}
              value={faction.name}
              subtitle={faction.shortDescription}
              image={faction.imageUrl ? faction.imageUrl : defaultFactionImage}
              grayscale={isSelected(faction.id) ? 0 : 1}
              onClick={() => handleFactionChange(faction.id)}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default TacticalGameViewFactions;
