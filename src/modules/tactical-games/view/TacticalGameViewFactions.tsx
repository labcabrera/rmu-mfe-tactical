import React, { Dispatch, FC, SetStateAction } from 'react';
import { Grid } from '@mui/material';
import {
  CategorySeparator,
  deleteTacticalGameFaction,
  addTacticalGameFaction,
  RmuTextCard,
  TacticalGame,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { t } from 'i18next';
import { useError } from '../../../ErrorContext';
import type { Faction } from '../../api/factions';
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
    const func = checked ? deleteTacticalGameFaction : addTacticalGameFaction;
    func(tacticalGame.id, factionId)
      .then((updatedGame) => setTacticalGame(updatedGame))
      .catch((err) => showError(err.message));
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
