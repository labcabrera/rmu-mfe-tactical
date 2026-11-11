import type { Character, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { HealingTables } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import type { ActorRound } from '../../api/actor-rounds.dto';
import {
  canHeal,
  healerCandidates,
  isProcedureAvailable,
  medicalDurationRounds,
  medicalProcedureProblem,
  previewTreatmentDifficulty,
} from './medical';

const injury = (patch: object = {}): Injury => ({ id: 'i', severity: 'light', type: 'cut', ...patch }) as Injury;
const row = (procedure: string, severity: string, injuryType: string, difficulty: string) => ({
  procedure,
  severity,
  injuryType,
  difficulty,
});
const tables = (patch: object): HealingTables => patch as unknown as HealingTables;
const actor = (patch: object = {}): ActorRound =>
  ({ actorId: 'a', actorName: 'A', effects: [], ...patch }) as unknown as ActorRound;

describe('previewTreatmentDifficulty', () => {
  const rows = tables({
    treatmentDifficulties: [row('dress', 'light', 'cut', 'h'), row('dress', 'medium', 'cut', 'vh')],
  });

  it('uses the table row of the procedure, severity and type', () => {
    expect(previewTreatmentDifficulty('dress', injury(), rows)).toMatchObject({
      kind: 'value',
      value: -10,
      source: 'table',
      head: false,
      bleeding: 0,
    });
  });

  it('uses the legacy difficulty without core tables and for magic', () => {
    expect(previewTreatmentDifficulty('tourniquet', injury(), null)).toMatchObject({ value: -20, source: 'legacy' });
    expect(previewTreatmentDifficulty('magic', injury(), rows)).toMatchObject({ value: 0, source: 'legacy' });
  });

  it('makes a head injury one step harder, by the table of rules when it has one', () => {
    expect(previewTreatmentDifficulty('dress', injury({ location: 'head' }), rows)).toMatchObject({
      value: -20,
      head: true,
    });
    const steps = tables({
      treatmentDifficulties: rows.treatmentDifficulties,
      treatmentRules: { headDifficultySteps: 2 },
    });
    expect(previewTreatmentDifficulty('dress', injury({ location: 'head' }), steps)).toMatchObject({ value: -30 });
  });

  it('stops at the hardest difficulty of the ladder', () => {
    const hardest = tables({ treatmentDifficulties: [row('dress', 'light', 'cut', 'ni')] });
    expect(previewTreatmentDifficulty('dress', injury({ location: 'head' }), hardest)).toMatchObject({ value: -100 });
  });

  it('adds the bleeding only when cauterizing', () => {
    expect(previewTreatmentDifficulty('cauterize', injury({ bleeding: 3 }), null)).toMatchObject({
      value: 15,
      bleeding: -15,
    });
    expect(previewTreatmentDifficulty('stitches', injury({ bleeding: 3 }), null)).toMatchObject({ bleeding: 0 });
  });

  it('takes an unknown type when its severity rows agree and asks for the type when they do not', () => {
    const agreeing = tables({
      treatmentDifficulties: [row('dress', 'light', 'cut', 'h'), row('dress', 'light', 'burn', 'h')],
    });
    expect(previewTreatmentDifficulty('dress', injury({ type: undefined }), agreeing)).toMatchObject({ value: -10 });
    const differing = tables({
      treatmentDifficulties: [row('dress', 'light', 'cut', 'h'), row('dress', 'light', 'burn', 'e')],
    });
    expect(previewTreatmentDifficulty('dress', injury({ type: undefined }), differing)).toEqual({
      kind: 'type-required',
    });
  });

  it('says a known type without a row is not applicable', () => {
    expect(previewTreatmentDifficulty('dress', injury({ type: 'burn' }), rows)).toEqual({ kind: 'not-applicable' });
  });
});

describe('isProcedureAvailable', () => {
  it('limits stitches to light and medium wounds', () => {
    expect(isProcedureAvailable('stitches', injury({ severity: 'medium' }))).toBe(true);
    expect(isProcedureAvailable('stitches', injury({ severity: 'severe' }))).toBe(false);
  });

  it('limits tourniquets, splints and casts to limbs or an unknown place', () => {
    expect(isProcedureAvailable('splint', injury({ location: 'arm' }))).toBe(true);
    expect(isProcedureAvailable('cast', injury())).toBe(true);
    expect(isProcedureAvailable('tourniquet', injury({ location: 'head' }))).toBe(false);
  });

  it('allows the other procedures anywhere', () => {
    expect(isProcedureAvailable('pressure', injury({ location: 'head', severity: 'severe' }))).toBe(true);
  });
});

describe('medicalProcedureProblem', () => {
  const surgery = tables({ surgeryRequired: [{ injuryType: 'cut', severity: 'light' }] });

  it('reports a healed injury, then one being treated', () => {
    expect(medicalProcedureProblem('dress', injury({ status: 'healed' }), null)).toBe('err-injury-healed');
    expect(medicalProcedureProblem('dress', injury({ treatmentInProgress: true }), null)).toBe(
      'err-treatment-in-progress'
    );
  });

  it('demands surgery except for magic', () => {
    expect(medicalProcedureProblem('dress', injury(), surgery)).toBe('err-treatment-surgery-required');
    expect(medicalProcedureProblem('magic', injury(), surgery)).toBeUndefined();
  });

  it('names the reason of a procedure that does not apply', () => {
    expect(medicalProcedureProblem('stitches', injury({ severity: 'severe' }), null)).toBe(
      'err-treatment-invalid-severity'
    );
    expect(medicalProcedureProblem('splint', injury({ location: 'head' }), null)).toBe(
      'err-treatment-invalid-location'
    );
  });

  it('accepts a procedure that applies', () => {
    expect(medicalProcedureProblem('dress', injury(), null)).toBeUndefined();
  });
});

describe('medicalDurationRounds', () => {
  const durations = tables({
    treatmentDurations: [
      { procedure: 'pressure', rounds: 2, perBleeding: true },
      { procedure: 'dress', rounds: 3 },
      { procedure: 'stitches', rounds: null },
    ],
  });

  it('leaves it to the API without the table', () => {
    expect(medicalDurationRounds('dress', injury(), null)).toBeUndefined();
    expect(medicalDurationRounds('dress', injury(), tables({ treatmentDurations: [] }))).toBeUndefined();
  });

  it('is 1 for a procedure without a row and null for one not offered in combat', () => {
    expect(medicalDurationRounds('stabilize', injury(), durations)).toBe(1);
    expect(medicalDurationRounds('stitches', injury(), durations)).toBeNull();
  });

  it('multiplies by the bleeding, counting at least 1', () => {
    expect(medicalDurationRounds('pressure', injury({ bleeding: 3 }), durations)).toBe(6);
    expect(medicalDurationRounds('pressure', injury({ bleeding: 0 }), durations)).toBe(2);
    expect(medicalDurationRounds('dress', injury({ bleeding: 3 }), durations)).toBe(3);
  });
});

describe('canHeal', () => {
  it('needs an actor who is up, not stunned nor panicked', () => {
    expect(canHeal(actor())).toBe(true);
    expect(canHeal(actor({ effects: [{ status: 'stunned' }] }))).toBe(false);
    expect(canHeal(actor({ effects: [{ status: 'fear-broken' }] }))).toBe(false);
    expect(canHeal(actor({ effects: [{ status: 'unconcious' }] }))).toBe(false);
  });
});

describe('healerCandidates', () => {
  it('leaves out incapacitated actors but not stunned ones', () => {
    const rounds = [
      actor({ actorId: 'up' }),
      actor({ actorId: 'down', effects: [{ status: 'dead' }] }),
      actor({ actorId: 'stunned', effects: [{ status: 'stunned' }] }),
    ];
    expect(healerCandidates(rounds, []).map((candidate) => candidate.id)).toEqual(['up', 'stunned']);
  });

  it('reads the Medicine bonus of the character, by its id or the one of the actor', () => {
    const characters = [
      { id: 'c1', skills: [{ skillId: 'medicine', totalBonus: 35 }] },
      { id: 'a2', skills: [{ skillId: 'medicine', totalBonus: 12 }] },
    ] as unknown as Character[];
    const rounds = [actor({ actorId: 'a1', characterId: 'c1' }), actor({ actorId: 'a2' }), actor({ actorId: 'npc' })];
    expect(healerCandidates(rounds, characters).map((candidate) => candidate.medicine)).toEqual([35, 12, 0]);
  });
});
