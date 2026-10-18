import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Box } from '@mui/material';
import { imageBaseUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound, ActorRoundEffect, ActorRoundPenaltyModifier } from '../../api/actor-rounds.dto';
import { isActorRoundDead } from '../../services/actor-round-service';
import Effect from '../../shared/generic/Effect';
import ActorRoundAlerts from './ActorRoundAlerts';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  if (!actorRound) return null;

  const isDead = isActorRoundDead(actorRound);
  const hasEffects = actorRound.effects.length > 0;
  const background = isDead
    ? `${imageBaseUrl}images/actions/actor-dead-01.png`
    : hasEffects
      ? `${imageBaseUrl}images/actions/actor-effects-01.png`
      : `${imageBaseUrl}images/actions/actor-ok-01.png`;

  const getEffectLabel = (effect: ActorRoundEffect): string => {
    let label = '';
    switch (effect.status) {
      case 'dmg':
        break;
      case 'penalty':
        label = t('penalty');
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
        backgroundImage: `linear-gradient(90deg, rgba(22, 27, 28, 0.72), rgba(102, 113, 113, 0.28)), linear-gradient(0deg, rgba(87, 97, 97, 0.18), rgba(87, 97, 97, 0.18)), url('${background}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'normal, color, normal',
        width: '100%',
        height: '100%',
        color: (theme) => (actorRound.imageUrl ? theme.palette.getContrastText(theme.palette.common.black) : undefined),
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
