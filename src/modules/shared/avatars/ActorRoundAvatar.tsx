import React, { FC, useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import { npcImage, resolveAssetUrl } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../../CombatContext';
import { ActorRound } from '../../api/actor-rounds.dto';

const initials = (name: string | undefined) =>
  (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/** Image of an actor: its own, or for an NPC the one of its creature group (spec 055). */
export const useActorRoundImage = (actorRound: ActorRound | undefined): string | undefined => {
  const npcs = useContext(CombatContext)?.npcs;
  if (actorRound?.imageUrl) return resolveAssetUrl(actorRound.imageUrl);
  const npc = actorRound?.npcId ? npcs?.find((each) => each.id === actorRound.npcId) : undefined;
  return npc ? resolveAssetUrl(npcImage(npc)) : undefined;
};

/**
 * Avatar of an actor: its miniature image (the players need it to find the figure on the table), or its
 * initials when it has none.
 */
const ActorRoundAvatar: FC<{
  actorRound?: ActorRound;
  size?: number;
  dead?: boolean;
  variant?: 'circular' | 'rounded' | 'square';
}> = ({ actorRound, dead = false, variant = 'circular', size = 40 }) => (
  <Avatar
    src={useActorRoundImage(actorRound)}
    variant={variant}
    alt={actorRound?.actorName}
    sx={{
      width: size,
      height: size,
      flexShrink: 0,
      fontSize: size * 0.4,
      fontWeight: 700,
      bgcolor: 'background.light',
      color: dead ? 'text.disabled' : 'text.primary',
      border: 1,
      borderColor: 'divider',
      filter: dead ? 'grayscale(1)' : undefined,
      opacity: dead ? 0.6 : 1,
    }}
  >
    {initials(actorRound?.actorName)}
  </Avatar>
);

export default ActorRoundAvatar;
