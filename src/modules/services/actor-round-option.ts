import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterOption, npcImage } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { ActorRound } from '../api/actor-rounds.dto';
import {
  actorRoundHasEffect,
  isActorRoundDisabled,
  isActorRoundFlatfooted,
  isActorRoundProne,
  isActorRoundStunned,
} from './actor-round-service';
import { useFactionColor } from './faction-colors';

/**
 * Turns the actors of the current combat into options of the shared `CharacterPicker` (spec 038): their miniature,
 * the colour and name of their faction, and their states as badges.
 */
export const useActorRoundOption = () => {
  const { t } = useTranslation();
  const { factions, npcs } = useContext(CombatContext)!;
  const factionColor = useFactionColor();
  // An NPC without an image of its own takes the one of its creature group (spec 055).
  const npcAvatar = (actorRound: ActorRound) => {
    const npc = actorRound.npcId ? npcs?.find((each) => each.id === actorRound.npcId) : undefined;
    return npc ? npcImage(npc) : undefined;
  };
  return (actorRound: ActorRound, extra: Partial<CharacterOption> = {}): CharacterOption => ({
    id: actorRound.actorId,
    name: actorRound.actorName,
    imageUrl: actorRound.imageUrl || npcAvatar(actorRound),
    factionId: actorRound.factionId,
    factionName: factions?.find((faction) => faction.id === actorRound.factionId)?.name ?? actorRound.factionId,
    color: factionColor(actorRound.factionId),
    badges: [
      isActorRoundDisabled(actorRound) && t('down'),
      isActorRoundProne(actorRound) && t('prone'),
      isActorRoundStunned(actorRound) && t('stunned'),
      isActorRoundFlatfooted(actorRound) && t('flatfooted'),
      actorRoundHasEffect(actorRound, ['surprised']) && t('surprised'),
    ].filter(Boolean) as string[],
    ...extra,
  });
};
