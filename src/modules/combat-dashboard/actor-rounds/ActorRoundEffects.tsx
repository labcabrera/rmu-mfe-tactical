import React, { FC } from 'react';
import { Card, CardContent, Box } from '@mui/material';
import { ActorRound, ActorRoundEffect, ActorRoundPenaltyModifier } from '../../api/actor-rounds.dto';
import { imageBaseUrl } from '../../services/config';
import Effect from '../../shared/generic/Effect';
import ActorRoundAlerts from './ActorRoundAlerts';
import { useTranslation } from 'react-i18next';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  
  if (!actorRound) return <p>Loading...</p>;

  const isDead = actorRound.effects.find(
    (e) => e.status === 'dead' || e.status === 'dying' || e.status === 'unconcious'
  );
  const hasEffects = actorRound.effects.length > 0;
  const background = isDead
    ? `${imageBaseUrl}images/actions/actor-dead-01.png`
    : hasEffects
      ? `${imageBaseUrl}images/actions/actor-effects-01.png`
      : `${imageBaseUrl}images/actions/actor-ok-01.png`;

  //if (!actorRound.effects || actorRound.effects.length === 0) return null;

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
    <Card
      sx={{
        backgroundImage: `url('${background}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '100%',
        color: (theme) => (actorRound.imageUrl ? theme.palette.getContrastText('#000') : undefined),
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {actorRound.effects.map((effect, index) => (
            <Effect key={`effect-${index}`} label={getEffectLabel(effect)} status={effect.status} />
          ))}
          {actorRound.penalty.modifiers &&
            actorRound.penalty.modifiers.map((modifier, index) => (
              <Effect key={`penalty-${index}`} label={getPenaltyEffect(modifier)} status={'penalty'} />
            ))}
          <ActorRoundAlerts actorRound={actorRound} />
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActorRoundEffects;
