import React, { FC, ReactElement, ReactNode } from 'react';
import BackpackIcon from '@mui/icons-material/Backpack';
import BoltIcon from '@mui/icons-material/Bolt';
import CodeIcon from '@mui/icons-material/Code';
import DashboardIcon from '@mui/icons-material/Dashboard';
import HealingIcon from '@mui/icons-material/Healing';
import PetsIcon from '@mui/icons-material/Pets';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import { Box, Divider, Stack } from '@mui/material';
import { ActorRound } from '../../api/actor-rounds.dto';
import BoardActorRoundEffects from '../../combat-dashboard/actor-rounds/ActorRoundEffects';
import { isDevelopment } from '../../services/action-service';
import ActorRoundAttacks from '../ActorRoundAttacks';
import ActorRoundBars from '../ActorRoundBars';
import ActorRoundCreature from '../ActorRoundCreature';
import ActorRoundDefenseMode from '../ActorRoundDefenseMode';
import ActorRoundEffects from '../ActorRoundEffects';
import ActorRoundFightingStyle from '../ActorRoundFightingStyle';
import ActorRoundHpLog from '../ActorRoundHpLog';
import ActorRoundInjuries from '../ActorRoundInjuries';
import ActorRoundItems from '../ActorRoundItems';
import ActorRoundResistances from '../ActorRoundResistances';
import ActorRoundPoisons from '../poison/ActorRoundPoisons';

export type ActorRoundTab = 'summary' | 'creature' | 'combat' | 'health' | 'status' | 'items' | 'dev';

/** Tabs of the actor sheet (spec 045, decision 3): label key, icon and the existing sections they show. */
export const ACTOR_ROUND_TABS: { id: ActorRoundTab; label: string; icon: ReactElement }[] = [
  { id: 'summary', label: 'summary', icon: <DashboardIcon /> },
  { id: 'combat', label: 'combat', icon: <SportsMartialArtsIcon /> },
  { id: 'health', label: 'health', icon: <HealingIcon /> },
  { id: 'status', label: 'status', icon: <BoltIcon /> },
  { id: 'items', label: 'actor-items', icon: <BackpackIcon /> },
  ...(isDevelopment ? [{ id: 'dev' as const, label: 'details', icon: <CodeIcon /> }] : []),
];

/** Whether an actor is an NPC (spec 055): no character sheet, items, fighting styles or spells. */
export const isNpcActorRound = (actorRound: ActorRound | undefined): boolean => actorRound?.actorType === 'npc';

/** Tabs of an actor: an NPC has its stat block after the summary and no items (spec 055). */
export const actorRoundTabs = (actorRound: ActorRound | undefined) =>
  isNpcActorRound(actorRound)
    ? ACTOR_ROUND_TABS.flatMap((tab) => {
        if (tab.id === 'items') return [];
        if (tab.id === 'summary')
          return [tab, { id: 'creature' as const, label: 'npc-stat-block', icon: <PetsIcon /> }];
        return [tab];
      })
    : ACTOR_ROUND_TABS;

/** The sections of a tab, one under the other. */
const Sections: FC<{ children: ReactNode }> = ({ children }) => (
  <Stack spacing={2} divider={<Divider flexItem />}>
    {children}
  </Stack>
);

/** Content of one tab of the actor sheet. The sections are the same components the side panel used to stack. */
const ActorRoundTabContent: FC<{ actorRound: ActorRound; tab: ActorRoundTab }> = ({ actorRound, tab }) => {
  switch (tab) {
    case 'creature':
      return <ActorRoundCreature actorRound={actorRound} />;
    case 'combat':
      return (
        <Sections>
          <ActorRoundAttacks actorRound={actorRound} />
          <ActorRoundDefenseMode actorRound={actorRound} />
          {!isNpcActorRound(actorRound) && !!actorRound.fightingStyles?.length && (
            <ActorRoundFightingStyle actorRound={actorRound} />
          )}
        </Sections>
      );
    case 'health':
      return (
        <Sections>
          <Stack spacing={1}>
            <ActorRoundPoisons actorRound={actorRound} />
            <ActorRoundInjuries actorRound={actorRound} />
          </Stack>
          <ActorRoundHpLog actorRound={actorRound} defaultExpanded />
        </Sections>
      );
    case 'status':
      // Spec 045, decision 4: the penalties section stays out until its add and remove are implemented.
      return (
        <Sections>
          <ActorRoundEffects actorRound={actorRound} />
          <ActorRoundResistances actorRound={actorRound} />
        </Sections>
      );
    case 'items':
      return isNpcActorRound(actorRound) ? null : <ActorRoundItems actorRound={actorRound} />;
    case 'dev':
      return (
        <Box component="pre" sx={{ m: 0, fontSize: 12, overflowX: 'auto' }}>
          {JSON.stringify(actorRound, null, 2)}
        </Box>
      );
    default:
      return (
        <Sections>
          <ActorRoundBars actorRound={actorRound} />
          <BoardActorRoundEffects actorRound={actorRound} />
          <ActorRoundResistances actorRound={actorRound} />
        </Sections>
      );
  }
};

export default ActorRoundTabContent;
