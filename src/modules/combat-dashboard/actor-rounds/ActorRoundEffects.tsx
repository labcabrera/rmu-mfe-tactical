import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack } from '@mui/material';
import { EffectList } from '@labcabrera-rmu/rmu-react-shared-lib';
import { ActorRound } from '../../api/actor-rounds.dto';
import ActorRoundAlerts from './ActorRoundAlerts';

/**
 * Effects, penalties and pending alerts of an actor, and its declared dodge and block. The API keeps one stun per
 * severity, so each one is its own chip with its penalty and rounds.
 */
const ActorRoundEffects: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  if (!actorRound) return null;
  const mode = actorRound.defenseMode;
  const defenses = (['dodge', 'block'] as const).filter((kind) => mode && mode[kind] !== 'none');
  return (
    <Stack spacing={1} sx={{ p: 1.25 }}>
      <EffectList
        effects={actorRound.effects}
        penalties={(actorRound.penalty?.modifiers || []).map((modifier) => ({
          source: modifier.source,
          value: modifier.value,
        }))}
      />
      {defenses.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
          {defenses.map((kind) => (
            <Chip
              key={kind}
              size="small"
              variant="outlined"
              color="info"
              label={`${t(kind === 'dodge' ? 'dodge' : 'shield-block')}: ${t(`${kind}-level-${mode![kind]}`)}`}
            />
          ))}
        </Stack>
      )}
      <ActorRoundAlerts actorRound={actorRound} />
    </Stack>
  );
};

export default ActorRoundEffects;
