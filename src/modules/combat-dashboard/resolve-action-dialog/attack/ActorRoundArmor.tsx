import React, { FC } from 'react';
import { TextField } from '@mui/material';
import { ActorRound } from '../../../api/actor-rounds.dto';

const ActorRoundArmor: FC<{
  actorRound: ActorRound;
}> = ({ actorRound }) => {
  if (!actorRound) return <div>Loading...</div>;

  const getFormattedArmor = (): string => {
    if (!actorRound || !actorRound.defense) return '';
    if (actorRound.defense.at !== undefined && actorRound.defense.at !== null) return String(actorRound.defense.at);
    return `${actorRound.defense.headAt} / ${actorRound.defense.bodyAt} / ${actorRound.defense.armsAt} / ${actorRound.defense.legsAt}`;
  };

  return <TextField label="Armor" value={getFormattedArmor()} name="armor" fullWidth variant="standard" />;
};

export default ActorRoundArmor;
