import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Chip, Stack } from '@mui/material';
import { ChipRow, EffectList, useApiNotify } from '@labcabrera-rmu/rmu-react-shared-lib';
import { deleteActorRoundEffect } from '../../api/actor-rounds';
import { ActorRound } from '../../api/actor-rounds.dto';
import { useCombatGame, useCombatRound, useCombatActions } from '../../combat/combat-context';
import { actorRoundBleedingEffect } from '../../services/actor-round-service';
import ActorRoundAlerts from './ActorRoundAlerts';

/**
 * Effects, penalties and pending alerts of an actor, and its declared dodge and block. The API keeps one stun per
 * severity, so each one is its own chip with its penalty and rounds. `compact` shows them as badges (abbreviation
 * and value, full text on hover or tap) for the narrow actor cell. In the current round of a game in progress the
 * full chips can delete an effect by hand; bleeding comes from the injuries and is treated there.
 */
const ActorRoundEffectsSummary: FC<{ actorRound: ActorRound; compact?: boolean }> = ({
  actorRound,
  compact = false,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const notify = useApiNotify();
  const combatGame = useCombatGame();
  const combatRound = useCombatRound();
  const combatActions = useCombatActions();
  const actorRounds = combatRound.actorRounds;
  if (!actorRound) return null;
  const game = combatGame.game;
  const editable = !!game && game.status === 'in_progress' && combatRound.displayRound === game.round;
  const removeEffect = (effectId: string) =>
    deleteActorRoundEffect(actorRound.id, effectId, auth)
      .then((updated) => combatActions.updateActorRound(updated))
      .catch((err) => notify.error(err));
  const mode = actorRound.defenseMode;
  const defenses = (['dodge', 'block'] as const).filter((kind) => mode && mode[kind] !== 'none');
  const bleeding = actorRoundBleedingEffect(actorRound);
  return (
    <Stack spacing={1} sx={{ p: compact ? 0 : 1.25 }}>
      <EffectList
        variant={compact ? 'compact' : 'full'}
        effects={bleeding ? [...actorRound.effects, bleeding] : actorRound.effects}
        // Workspace spec 077: a grapple names its grappler
        actorName={(actorId) => actorRounds?.find((each) => each.actorId === actorId)?.actorName}
        penalties={(actorRound.penalty?.modifiers || []).map((modifier) => ({
          source: modifier.source,
          value: modifier.value,
        }))}
        onDelete={editable ? (effect) => effect.id && removeEffect(effect.id) : undefined}
      />
      {defenses.length > 0 && (
        <ChipRow>
          {defenses.map((kind) => (
            <Chip
              key={kind}
              size="small"
              variant="outlined"
              color="info"
              label={`${t(kind === 'dodge' ? 'dodge' : 'shield-block')}: ${t(`${kind}-level-${mode![kind]}`)}`}
            />
          ))}
        </ChipRow>
      )}
      <ActorRoundAlerts actorRound={actorRound} />
    </Stack>
  );
};

export default ActorRoundEffectsSummary;
