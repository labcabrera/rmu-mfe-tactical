import React, { FC } from 'react';
import { Grid } from '@mui/material';
import { t } from 'i18next';
import { ActorRound, ActorRoundEffect, ActorRoundPenaltyModifier } from '../../api/actor-rounds.dto';
import Effect from '../../shared/generic/Effect';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return <p>Loading...</p>;

  if (!actorRound.effects || actorRound.effects.length === 0) return null;

  const getEffectLabel = (effect: ActorRoundEffect): string => {
    let label = '';
    switch (effect.status) {
      case 'dmg':
        break;
      case 'penalty':
        label = t('Penalty');
        break;
      default:
        label = t(`${effect.status}`);
        break;
    }
    if (effect.value) {
      label += ` ${effect.value}`;
    }
    if (effect.rounds) {
      label += effect.rounds > 1 ? ` (${effect.rounds} ${t('rounds')})` : ` (1 ${t('round')})`;
    }
    return label;
  };

  const getPenaltyEffect = (modifier: ActorRoundPenaltyModifier): string => {
    if (modifier.source === 'hp') return `${t('penalty-hp')} ${modifier.value}`;
    return `${t('penalty')} ${modifier.value}`;
  };

  return (
    <Grid container spacing={1}>
      {actorRound.effects.map((effect, index) => (
        <Effect key={`effect-${index}`} label={getEffectLabel(effect)} status={effect.status} />
      ))}
      {actorRound.penalty.modifiers &&
        actorRound.penalty.modifiers.map((modifier, index) => (
          <Effect key={`penalty-${index}`} label={getPenaltyEffect(modifier)} status={'penalty'} />
        ))}
    </Grid>
  );
};

export default ActorRoundEffects;
