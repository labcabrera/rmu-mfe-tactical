import { describe, expect, it } from 'vitest';
import type { Action } from '../../api/action.dto';
import type { ActorRound } from '../../api/actor-rounds.dto';
import {
  actorFearState,
  entryApProfile,
  entryUnavailable,
  filterPaletteGroups,
  paletteAvailability,
  PaletteEntry,
  PaletteGroup,
  pastPhases,
} from './palette-rules';

const actor = (patch: object = {}): ActorRound =>
  ({ actorId: 'a', effects: [], apLedger: [], ...patch }) as unknown as ActorRound;
const action = (patch: object): Action =>
  ({ id: 'x', actorId: 'a', status: 'declared', phaseStart: 1, ...patch }) as unknown as Action;
const availability = (round: ActorRound, actions: Action[] = [], phase = 1, current = 1) =>
  paletteAvailability(round, actions, phase, current);

describe('actorFearState', () => {
  it('returns the worst state the actor has', () => {
    expect(actorFearState(actor({ effects: [{ status: 'fear-balk' }, { status: 'fear-routed' }] }))).toBe(
      'fear-routed'
    );
    expect(actorFearState(actor())).toBeUndefined();
  });
});

describe('pastPhases', () => {
  it('lists the action phases before the current one', () => {
    expect(pastPhases(3)).toEqual([1, 2]);
    expect(pastPhases(1)).toEqual([]);
    expect(pastPhases(5)).toEqual([]);
  });
});

describe('paletteAvailability', () => {
  it('knows the actor already moves in a phase its movement covers', () => {
    const movement = action({ actionType: 'movement', phaseStart: 1, phaseEnd: 2 });
    expect(availability(actor(), [movement], 2).moving).toBe(true);
    expect(availability(actor(), [movement], 3).moving).toBe(false);
    expect(availability(actor(), [{ ...movement, actorId: 'b' }], 2).moving).toBe(false);
  });

  it('interrupts only open actions that are not movements nor free', () => {
    const open = action({ actionType: 'melee_attack' });
    const free = action({ id: 'f', actionType: 'other', freeAction: true });
    const movement = action({ id: 'm', actionType: 'movement' });
    expect(availability(actor(), [open, free, movement]).interrupted.map((a) => a.id)).toEqual(['x']);
  });

  it('gives back the AP of the phase when an action is interrupted', () => {
    expect(availability(actor()).remaining).toBe(4);
    expect(availability(actor(), [action({ actionType: 'melee_attack' })]).remaining).toBe(5);
  });

  it('explains why the actor cannot act in the phase', () => {
    expect(availability(actor({ effects: [{ status: 'flatfooted' }] })).roundReason).toBe('err-action-flatfooted');
    expect(availability(actor({ effects: [{ status: 'surprised', value: 2 }] })).roundReason).toBe(
      'err-action-surprised-phase'
    );
    expect(availability(actor({ apCapacity: [0, 1, 1, 1] })).roundReason).toBe('no-ap-in-phase');
    expect(availability(actor()).roundReason).toBeUndefined();
  });

  it('lets a fleeing actor only move, dodge or use its first free action', () => {
    const broken = actor({ effects: [{ status: 'fear-broken' }] });
    const { fearReason } = availability(broken);
    expect(fearReason('melee_attack', false)).toBe('palette-fear-only-flee-fear-broken');
    expect(fearReason('movement', false)).toBeUndefined();
    expect(fearReason('dodge', false)).toBeUndefined();
    expect(fearReason('other', true)).toBeUndefined();
    const used = availability(broken, [action({ actionType: 'other', freeAction: true })]);
    expect(used.fearReason('other', true)).toBe('palette-fear-only-flee-fear-broken');
  });

  it('counts a first free action per round, or two with Quick Action', () => {
    const broken = { effects: [{ status: 'fear-broken' }] };
    const quick = actor({ ...broken, traits: [{ traitId: 'quick-action', tier: 1 }] });
    expect(
      availability(quick, [action({ actionType: 'other', freeAction: true })]).fearReason('other', true)
    ).toBeUndefined();
  });

  it('does not restrain an actor that only balks', () => {
    expect(
      availability(actor({ effects: [{ status: 'fear-balk' }] })).fearReason('melee_attack', false)
    ).toBeUndefined();
  });

  describe('a retroactive declaration', () => {
    it('applies only to past phases and non-free actions', () => {
      expect(availability(actor()).retroactive).toBe(false);
      expect(availability(actor(), [], 1, 2).retroactiveReason('other', true)).toBeUndefined();
      expect(availability(actor(), [], 1, 1).retroactiveReason('other', false)).toBeUndefined();
    });

    it('cannot start while another action is open, except a movement', () => {
      const open = action({ actionType: 'melee_attack' });
      const past = availability(actor(), [open], 1, 2);
      expect(past.retroactiveReason('other', false)).toBe('err-action-retroactive-open-action');
      expect(past.retroactiveReason('movement', false)).toBeUndefined();
    });

    it('needs AP in every phase gone by, leaving a drawn weapon to the API', () => {
      const spent = actor({ apLedger: [{ phase: 1, ap: 1, kind: 'spent' }] });
      const past = availability(spent, [], 1, 2);
      expect(past.retroactiveReason('melee_attack', false)).toBe('err-action-retroactive-no-ap');
      expect(past.retroactiveReason('draw_and_load', false)).toBeUndefined();
      expect(availability(actor(), [], 1, 2).retroactiveReason('melee_attack', false)).toBeUndefined();
    });
  });
});

describe('entryApProfile', () => {
  it('is 0 for a free or forced entry', () => {
    expect(entryApProfile('other', { freeAction: true })).toEqual({ min: 0, max: 0 });
    expect(entryApProfile('melee_attack', { forced: 'effect' })).toEqual({ min: 0, max: 0 });
  });

  it('prefers the range of the entry over the one of its type', () => {
    expect(entryApProfile('maneuver', { ap: { min: 2, max: 4 } })).toEqual({ min: 2, max: 4 });
  });
});

describe('entryUnavailable', () => {
  const blocked = availability(actor({ effects: [{ status: 'surprised', value: 2 }] }));

  it('puts the state of the actor before the reason of the entry', () => {
    expect(entryUnavailable(blocked, 'maneuver', { unavailable: 'no-skill' })).toBe('err-action-surprised-phase');
  });

  it('lets a forced attack through unless the actor is flatfooted', () => {
    expect(entryUnavailable(blocked, 'melee_attack', { forced: 'effect' })).toBeUndefined();
    const flat = availability(actor({ effects: [{ status: 'flatfooted' }] }));
    expect(entryUnavailable(flat, 'melee_attack', { forced: 'effect' })).toBe('err-action-flatfooted');
  });

  it('gives the reason of the entry, then the fear of the actor', () => {
    const broken = availability(actor({ effects: [{ status: 'fear-broken' }] }));
    expect(entryUnavailable(broken, 'maneuver', { unavailable: 'no-skill' })).toBe('no-skill');
    expect(entryUnavailable(broken, 'maneuver', {})).toBe('palette-fear-only-flee-fear-broken');
  });

  it('is clear for an available entry', () => {
    expect(entryUnavailable(availability(actor()), 'maneuver', {})).toBeUndefined();
  });
});

describe('filterPaletteGroups', () => {
  const entry = (label: string): PaletteEntry => ({ key: label, type: 'other', label });
  const groups: PaletteGroup[] = [
    { key: 'a', label: 'A', entries: [entry('Melee attack'), entry('Dodge')] },
    { key: 'b', label: 'B', entries: [entry('Maneuver')] },
  ];

  it('keeps everything without a term', () => {
    expect(filterPaletteGroups(groups, '   ')).toEqual(groups);
  });

  it('matches regardless of case and drops the groups left empty', () => {
    const result = filterPaletteGroups(groups, 'DODGE');
    expect(result).toHaveLength(1);
    expect(result[0].entries.map((e) => e.label)).toEqual(['Dodge']);
  });
});
