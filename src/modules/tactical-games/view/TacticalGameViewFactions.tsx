import React, { Dispatch, FC, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Grid } from '@mui/material';
import {
  CategorySeparator,
  deleteTacticalGameFaction,
  addTacticalGameFaction,
  RmuTextCard,
  TacticalGame,
  Faction,
} from '@labcabrera-rmu/rmu-react-shared-lib';
import { useError } from '../../../ErrorContext';
import { defaultFactionImage } from '../../services/image-service';

const TacticalGameViewFactions: FC<{
  tacticalGame: TacticalGame;
  setTacticalGame: Dispatch<SetStateAction<TacticalGame | undefined>>;
  factions: Faction[];
}> = ({ tacticalGame, setTacticalGame, factions }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const { showError } = useError();

  const isSelected = (factionId: string) => {
    return tacticalGame.factions.includes(factionId);
  };

  const handleFactionChange = (factionId: string) => {
    const checked = isSelected(factionId);
    const func = checked ? deleteTacticalGameFaction : addTacticalGameFaction;
    func(tacticalGame.id, factionId, auth)
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
