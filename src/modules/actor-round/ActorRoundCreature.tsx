import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Typography } from '@mui/material';
import { CreatureStatBlock, fetchNpc, LoadingState } from '@labcabrera-rmu/rmu-react-shared-lib';
import { useQuery } from '@tanstack/react-query';
import { ActorRound } from '../api/actor-rounds.dto';
import { useCombatGame } from '../combat/combat-context';

/**
 * Stat block of the NPC an actor comes from (spec 055), in place of the character sheet: the NPCs of the game are in
 * the combat context; one missing there (a private NPC of another user) is read by its id.
 */
const ActorRoundCreature: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const known = useCombatGame().npcs?.find((npc) => npc.id === actorRound.npcId);
  const npcId = actorRound.npcId;
  const npcQuery = useQuery({
    queryKey: ['actor-round', 'npc', npcId],
    queryFn: () => fetchNpc(npcId as string, auth),
    enabled: !known && !!npcId,
    gcTime: 0,
  });

  const npc = known ?? (npcQuery.isError ? null : npcQuery.data);
  if (npc) return <CreatureStatBlock npc={npc} />;
  if (npc === null || !npcId) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('npc-not-available')}
      </Typography>
    );
  }
  return <LoadingState />;
};

export default ActorRoundCreature;
