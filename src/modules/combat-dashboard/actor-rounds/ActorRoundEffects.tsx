import React, { FC } from 'react';
import { Card, CardContent, Stack } from '@mui/material';
import { EffectList, imageBaseUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import { isActorRoundDead } from '../../services/actor-round-service';
import ActorRoundAlerts from './ActorRoundAlerts';

const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  if (!actorRound) return null;

  const isDead = isActorRoundDead(actorRound);
  const hasEffects = actorRound.effects.length > 0;
  const background = isDead
    ? `${imageBaseUrl}images/actions/actor-dead-01.png`
    : hasEffects
      ? `${imageBaseUrl}images/actions/actor-effects-01.png`
      : `${imageBaseUrl}images/actions/actor-ok-01.png`;

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
        <Stack spacing={1}>
          <EffectList
            effects={actorRound.effects}
            penalties={(actorRound.penalty?.modifiers || []).map((modifier) => ({
              source: modifier.source,
              value: modifier.value,
            }))}
          />
          <ActorRoundAlerts actorRound={actorRound} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ActorRoundEffects;
