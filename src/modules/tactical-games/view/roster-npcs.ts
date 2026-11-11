import { Faction, NpcEntry, TacticalGame } from '@labcabrera-rmu/rmu-react-shared-lib';

/** One specimen of an NPC of a strategic faction, chosen for a tactical game like a character. */
export type FactionNpcSpecimen = {
  id: string;
  name: string;
  npcId: string;
  factionId: string;
  /** Its actor, when it is in the game. */
  actorId?: string;
};

/** The specimens of the NPCs of a faction: `Wolf` for one, `Wolf 1`, `Wolf 2`... for several, as the API names them. */
export const factionNpcSpecimens = (faction: Faction, game: TacticalGame): FactionNpcSpecimen[] =>
  (faction.npcs ?? []).flatMap((entry: NpcEntry, entryIndex) =>
    Array.from({ length: entry.count }, (_, index) => {
      const name = entry.count > 1 ? `${entry.name} ${index + 1}` : entry.name;
      const actor = game.actors.find(
        (each) =>
          each.type === 'npc' && each.faction.id === faction.id && each.npcId === entry.npcId && each.name === name
      );
      return {
        id: `npc:${faction.id}:${entryIndex}:${name}`,
        name,
        npcId: entry.npcId,
        factionId: faction.id,
        actorId: actor?.id,
      };
    })
  );

/** The request of a specimen: one, with its own name, so that it can join and leave the game on its own. */
export const specimenEntry = ({ npcId, name }: FactionNpcSpecimen): NpcEntry => ({ npcId, name, count: 1 });

/**
 * Key of the element whose change is being saved: a faction id, a character or actor id, `group:<factionId>` or
 * `npcs:<factionId>`.
 */
export type RosterPending = string | null;
