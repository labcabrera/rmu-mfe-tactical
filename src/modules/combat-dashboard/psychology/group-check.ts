import type { ActorRound } from '../../api/actor-rounds.dto';
import type {
  FearCheckDto,
  GroupCheckKind,
  GroupSelection,
  LeaderRequest,
  LeaderRollDto,
  MoraleCheckDto,
} from '../../api/psychology.dto';

// Client side of a group check (workspace spec 022, decisions 6, 7, 9 and 10): who takes it, and the request. The
// group is the factions and actors the game master picks, or the faction of the leader; the API resolves it.

export type GroupCheckForm = {
  kind: GroupCheckKind;
  factionIds: string[];
  actorIds: string[];
  leaderId: string | null;
  recognized: boolean;
  leadershipRanks: number | null;
  leadershipBonus: number | null;
  frightSource: 'level' | 'intimidator';
  frightLevel: number | null;
  intimidatorId: string | null;
  intimidationRanks: number | null;
  difficulty: string;
  roll: number | null;
  unmodified: number | null;
  modifier: number | null;
  /** Fear: rolls and RR bonuses typed by actor id; the API rolls the missing ones and reads the sheet. */
  rolls: Record<string, number | null>;
  bonuses: Record<string, number | null>;
};

export const initialGroupCheckForm = (kind: GroupCheckKind = 'fear'): GroupCheckForm => ({
  kind,
  factionIds: [],
  actorIds: [],
  leaderId: null,
  recognized: true,
  leadershipRanks: null,
  leadershipBonus: null,
  frightSource: 'level',
  frightLevel: null,
  intimidatorId: null,
  intimidationRanks: null,
  difficulty: 'm',
  roll: null,
  unmodified: null,
  modifier: null,
  rolls: {},
  bonuses: {},
});

/** NPCs have no sheet: their Leadership, Intimidation and RR bonus are typed. */
export const isNpc = (actorRound: ActorRound | undefined) => !!actorRound && actorRound.actorType !== 'character';

/** Actors of the group, as the API builds it: the factions and actors chosen, or the faction of the leader. */
export const groupMembers = (form: GroupCheckForm, actorRounds: ActorRound[]): ActorRound[] => {
  const leader = actorRounds.find((actorRound) => actorRound.actorId === form.leaderId);
  const factionIds =
    form.factionIds.length === 0 && form.actorIds.length === 0 && leader ? [leader.factionId] : form.factionIds;
  return actorRounds.filter(
    (actorRound) => factionIds.includes(actorRound.factionId) || form.actorIds.includes(actorRound.actorId)
  );
};

const definedEntries = (values: Record<string, number | null>, ids: string[]) =>
  Object.fromEntries(
    Object.entries(values).filter(([id, value]) => value !== null && Number.isFinite(value) && ids.includes(id))
  ) as Record<string, number>;

/** What is missing before the check can be sent, as a translation key; null when it is complete. */
export const groupCheckProblem = (form: GroupCheckForm, actorRounds: ActorRound[]): string | null => {
  const leader = actorRounds.find((actorRound) => actorRound.actorId === form.leaderId);
  if (form.kind !== 'fear' && !leader) return 'err-leader-required';
  if (groupMembers(form, actorRounds).length === 0) return form.kind === 'fear' ? 'err-group-required' : 'err-group-empty';
  if (form.kind === 'fear') {
    if (form.frightSource === 'level' && form.frightLevel === null) return 'err-fright-level-required';
    if (form.frightSource === 'intimidator') {
      const intimidator = actorRounds.find((actorRound) => actorRound.actorId === form.intimidatorId);
      if (!intimidator) return 'err-intimidator-required';
      if (isNpc(intimidator) && form.intimidationRanks === null) return 'err-intimidation-ranks-required';
    }
  }
  return null;
};

const leaderRequest = (form: GroupCheckForm, leader: ActorRound): LeaderRequest => ({
  actorId: leader.actorId,
  recognized: form.recognized,
  ...(isNpc(leader) && form.leadershipRanks !== null ? { leadershipRanks: form.leadershipRanks } : {}),
  ...(isNpc(leader) && form.leadershipBonus !== null ? { leadershipBonus: form.leadershipBonus } : {}),
});

/** Body of `POST /tactical-games/{id}/{kind}-checks`; unset values are left for the API. */
export const toGroupCheckRequest = (
  form: GroupCheckForm,
  actorRounds: ActorRound[]
): FearCheckDto | MoraleCheckDto | LeaderRollDto => {
  const leader = actorRounds.find((actorRound) => actorRound.actorId === form.leaderId);
  const group: GroupSelection | undefined =
    form.factionIds.length > 0 || form.actorIds.length > 0
      ? {
          ...(form.factionIds.length > 0 ? { factionIds: form.factionIds } : {}),
          ...(form.actorIds.length > 0 ? { actorIds: form.actorIds } : {}),
        }
      : undefined;
  const common = {
    ...(group ? { group } : {}),
    ...(form.modifier ? { modifiers: [{ key: 'custom-bonus', value: form.modifier }] } : {}),
  };
  const memberIds = groupMembers(form, actorRounds).map((actorRound) => actorRound.actorId);
  const bonuses = definedEntries(form.bonuses, memberIds);
  if (form.kind === 'fear') {
    const intimidator = actorRounds.find((actorRound) => actorRound.actorId === form.intimidatorId);
    const rolls = definedEntries(form.rolls, memberIds);
    return {
      ...common,
      ...(leader ? { leader: leaderRequest(form, leader) } : {}),
      ...(form.frightSource === 'level' && form.frightLevel !== null ? { frightLevel: form.frightLevel } : {}),
      ...(form.frightSource === 'intimidator' && intimidator
        ? {
            intimidatorActorId: intimidator.actorId,
            ...(isNpc(intimidator) && form.intimidationRanks !== null
              ? { intimidationRanks: form.intimidationRanks }
              : {}),
          }
        : {}),
      ...(Object.keys(rolls).length > 0 ? { rolls } : {}),
      ...(Object.keys(bonuses).length > 0 ? { bonuses } : {}),
    };
  }
  const leaderRoll: LeaderRollDto = {
    ...common,
    leader: leaderRequest(form, leader!),
    ...(form.roll !== null ? { roll: form.roll } : {}),
    ...(form.roll !== null && form.unmodified !== null && form.unmodified !== form.roll
      ? { unmodifiedRoll: form.unmodified }
      : {}),
  };
  if (form.kind === 'morale') {
    return {
      ...leaderRoll,
      difficulty: form.difficulty,
      ...(Object.keys(bonuses).length > 0 ? { bonuses } : {}),
    };
  }
  return leaderRoll;
};
