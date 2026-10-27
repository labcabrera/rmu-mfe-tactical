import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterOption } from '@labcabrera-rmu/rmu-react-shared-lib';
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
  const { factions } = useContext(CombatContext)!;
  const factionColor = useFactionColor();
  return (actorRound: ActorRound, extra: Partial<CharacterOption> = {}): CharacterOption => ({
    id: actorRound.actorId,
    name: actorRound.actorName,
    imageUrl: actorRound.imageUrl,
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
