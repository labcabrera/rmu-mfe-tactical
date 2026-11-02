import { useContext } from 'react';
import { npcImage, resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';

/** Image of an actor: its own, or for an NPC the one of its creature group (spec 055). */
export const useActorRoundImage = (actorRound: ActorRound | undefined): string | undefined => {
  const npcs = useContext(CombatContext)?.npcs;
  if (actorRound?.imageUrl) return resolveAssetUrl(actorRound.imageUrl);
  const npc = actorRound?.npcId ? npcs?.find((each) => each.id === actorRound.npcId) : undefined;
  return npc ? resolveAssetUrl(npcImage(npc)) : undefined;
};
