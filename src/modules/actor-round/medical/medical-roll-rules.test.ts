import type { HealerCandidate, Injury } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import type { DifficultyPreview } from './medical';
import {
  amputationRequest,
  initialHealer,
  initialMedicalForm,
  medicalDifficultyPreview,
  MedicalRollForm,
  medicalRollDto,
  medicalRollReady,
  MedicalTarget,
  reviveRequest,
  treatmentRequest,
} from './medical-roll-rules';

const injury = (patch: object = {}): Injury => ({ id: 'i1', severity: 'light', bleeding: 2, ...patch }) as Injury;
const candidate = (id: string): HealerCandidate => ({ id, name: id, medicine: 10 }) as HealerCandidate;
const healer = { mode: 'self' } as const;
const form = (patch: Partial<MedicalRollForm> = {}): MedicalRollForm => ({
  ...initialMedicalForm({ kind: 'revive' }, healer),
  roll: 50,
  ...patch,
});
const value: DifficultyPreview = { kind: 'value', value: 0, source: 'legacy', head: false, bleeding: 0 };

describe('initialHealer', () => {
  it('picks another actor before the patient', () => {
    expect(initialHealer([candidate('patient'), candidate('other')], 'patient')).toEqual({
      mode: 'character',
      characterId: 'other',
    });
  });

  it('falls back to the patient, then to an external healer', () => {
    expect(initialHealer([candidate('patient')], 'patient')).toEqual({ mode: 'self' });
    expect(initialHealer([], 'patient')).toEqual({ mode: 'external', name: '', medicine: 0 });
  });
});

describe('initialMedicalForm', () => {
  it('presses a bleeding wound and dresses any other', () => {
    expect(initialMedicalForm({ kind: 'treat', injury: injury() }, healer).procedure).toBe('pressure');
    expect(initialMedicalForm({ kind: 'treat', injury: injury({ bleeding: 0 }) }, healer).procedure).toBe('dress');
    expect(initialMedicalForm({ kind: 'treat', injury: injury({ bleeding: undefined }) }, healer).procedure).toBe(
      'dress'
    );
  });

  it('takes the limb and side of the injury of an amputation', () => {
    const target: MedicalTarget = { kind: 'amputate', injury: injury({ location: 'leg', side: 'right' }) };
    expect(initialMedicalForm(target, healer)).toMatchObject({ location: 'leg', side: 'right' });
  });

  it('defaults to the left arm for an injury elsewhere or none', () => {
    const elsewhere: MedicalTarget = { kind: 'amputate', injury: injury({ location: 'head' }) };
    expect(initialMedicalForm(elsewhere, healer)).toMatchObject({ location: 'arm', side: 'left' });
    expect(initialMedicalForm(null, healer)).toMatchObject({ location: 'arm', side: 'left', procedure: 'pressure' });
  });
});

describe('medicalDifficultyPreview', () => {
  const stored = (preview: DifficultyPreview) => (preview.kind === 'value' ? preview.value : undefined);

  it('fixes the emergency amputation and the stabilization', () => {
    expect(stored(medicalDifficultyPreview({ kind: 'amputate' }, form(), null))).toBe(-30);
    expect(stored(medicalDifficultyPreview({ kind: 'stabilize', effect: {} as never }, form(), null))).toBe(0);
  });

  it('reads a defibrillation from its difficulty, else the easiest of its range', () => {
    const defib = form({ method: 'defibrillation' });
    expect(stored(medicalDifficultyPreview({ kind: 'revive' }, defib, null))).toBe(-20);
    expect(stored(medicalDifficultyPreview({ kind: 'revive' }, { ...defib, defibrillation: -60 }, null))).toBe(-60);
  });

  it('asks a treatment for the table of its procedure', () => {
    const preview = medicalDifficultyPreview({ kind: 'treat', injury: injury() }, form({ procedure: 'dress' }), null);
    expect(preview).toMatchObject({ kind: 'value', source: 'legacy' });
  });
});

describe('medicalRollReady', () => {
  const target: MedicalTarget = { kind: 'revive' };

  it('needs a healer and a real roll', () => {
    expect(medicalRollReady(target, form(), value, true, false)).toBe(true);
    expect(medicalRollReady(target, form(), value, false, false)).toBe(false);
    expect(medicalRollReady(target, form({ roll: null }), value, true, false)).toBe(false);
    expect(medicalRollReady(target, form({ roll: Number.NaN }), value, true, false)).toBe(false);
  });

  it('accepts a preview without a value only with a difficulty set', () => {
    const none: DifficultyPreview = { kind: 'not-applicable' };
    expect(medicalRollReady(target, form(), none, true, false)).toBe(false);
    expect(medicalRollReady(target, form({ difficulty: -10 }), none, true, false)).toBe(true);
  });

  it('refuses a limb already lost', () => {
    expect(medicalRollReady(target, form(), value, true, true)).toBe(false);
  });

  it('keeps a typed defibrillation difficulty within its range', () => {
    const defib = form({ method: 'defibrillation', defibrillation: 10 });
    expect(medicalRollReady(target, defib, value, true, false)).toBe(false);
    expect(medicalRollReady(target, { ...defib, defibrillation: -70 }, value, true, false)).toBe(true);
    expect(medicalRollReady(target, { ...defib, defibrillation: null }, value, true, false)).toBe(true);
  });
});

describe('requests', () => {
  const internal = { external: false as const, characterId: 'h', name: 'h', medicine: 10 };
  const external = { external: true as const, characterId: undefined, name: 'Gandalf', medicine: 40 };

  it('sends a named healer or the actor, with the difficulty only when set', () => {
    expect(medicalRollDto({ kind: 'amputate' }, form(), internal as never, 60)).toEqual({
      healerActorId: 'h',
      roll: 60,
    });
    expect(medicalRollDto({ kind: 'amputate' }, form({ difficulty: -5 }), external as never, 60)).toEqual({
      healer: { name: 'Gandalf', bonus: 40 },
      roll: 60,
      difficulty: -5,
    });
  });

  it('never sends a difficulty with a revival', () => {
    expect(medicalRollDto({ kind: 'revive' }, form({ difficulty: -5 }), internal as never, 60)).toEqual({
      healerActorId: 'h',
      roll: 60,
    });
  });

  it('leaves unset fields out of an amputation', () => {
    expect(amputationRequest({ roll: 1 }, form({ location: 'leg', side: 'right' }), undefined)).toEqual({
      roll: 1,
      location: 'leg',
      side: 'right',
    });
    expect(amputationRequest({ roll: 1 }, form({ systemShockRoll: 7 }), injury())).toMatchObject({
      injuryId: 'i1',
      systemShockRoll: 7,
    });
  });

  it('sends the defibrillation fields only with that method', () => {
    expect(
      reviveRequest({ roll: 1, healerActorId: 'h' }, form({ defibrillation: -30, dangerousSource: true }))
    ).toEqual({
      healerActorId: 'h',
      roll: 1,
      method: 'respiratory',
    });
    expect(
      reviveRequest(
        { roll: 1, healer: { name: 'x', bonus: 0 } },
        form({ method: 'defibrillation', defibrillation: -30, dangerousSource: true, shockHitsRoll: 4 })
      )
    ).toEqual({
      healer: { name: 'x', bonus: 0 },
      roll: 1,
      method: 'defibrillation',
      defibrillationDifficulty: -30,
      dangerousSource: true,
      shockHitsRoll: 4,
    });
  });

  it('forgets the shock hits of a source that is not dangerous', () => {
    const request = reviveRequest(
      { roll: 1 },
      form({ method: 'defibrillation', dangerousSource: false, shockHitsRoll: 4 })
    );
    expect(request.dangerousSource).toBe(false);
    expect(request).not.toHaveProperty('shockHitsRoll');
  });

  it('sends the first die of a treatment only when it differs from the roll', () => {
    expect(treatmentRequest({ roll: 90 }, form({ procedure: 'dress', unmodified: 90 }))).toEqual({
      roll: 90,
      procedure: 'dress',
    });
    expect(treatmentRequest({ roll: 96 }, form({ procedure: 'dress', unmodified: 66 }))).toMatchObject({
      unmodifiedRoll: 66,
    });
  });

  it('sends the heat dice only when cauterizing', () => {
    expect(treatmentRequest({ roll: 1 }, form({ procedure: 'dress', heatHitsRoll: 3 }))).not.toHaveProperty(
      'heatHitsRoll'
    );
    expect(
      treatmentRequest({ roll: 1 }, form({ procedure: 'cauterize', heatHitsRoll: 3, heatCriticalRoll: 50 }))
    ).toMatchObject({ heatHitsRoll: 3, heatCriticalRoll: 50 });
  });
});
