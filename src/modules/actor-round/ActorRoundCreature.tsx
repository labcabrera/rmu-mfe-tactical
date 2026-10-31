import React, { FC, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import { Typography } from '@mui/material';
import { CreatureStatBlock, fetchNpc, LoadingState, Npc } from '@labcabrera-rmu/rmu-react-shared-lib';
import { CombatContext } from '../../CombatContext';
import { ActorRound } from '../api/actor-rounds.dto';

/**
 * Stat block of the NPC an actor comes from (spec 055), in place of the character sheet: the NPCs of the game are in
 * the combat context; one missing there (a private NPC of another user) is read by its id.
 */
const ActorRoundCreature: FC<{ actorRound: ActorRound }> = ({ actorRound }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const known = useContext(CombatContext)?.npcs?.find((npc) => npc.id === actorRound.npcId);
  const [fetched, setFetched] = useState<Npc | null>();
  const npcId = actorRound.npcId;

  useEffect(() => {
    if (known || !npcId) return;
    fetchNpc(npcId, auth)
      .then(setFetched)
      .catch(() => setFetched(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npcId, known]);

  const npc = known ?? fetched;
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
