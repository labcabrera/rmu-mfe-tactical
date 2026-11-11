import type { Character } from '@labcabrera-rmu/rmu-react-shared-lib';
import { describe, expect, it } from 'vitest';
import { notAbleReason } from './roster-rules';

const character = (patch: object): Character => patch as unknown as Character;

describe('notAbleReason', () => {
  it('rejects a dead character, by status or by an open condition', () => {
    expect(notAbleReason(character({ status: 'dead' }))).toBe('dead');
    expect(notAbleReason(character({ conditions: [{ status: 'dead' }] }))).toBe('dead');
  });

  it('rejects a permanently unconscious character', () => {
    expect(notAbleReason(character({ conditions: [{ status: 'permanent-unconscious' }] }))).toBe(
      'condition-permanent-unconscious'
    );
  });

  it('ignores conditions already resolved', () => {
    expect(notAbleReason(character({ conditions: [{ status: 'dead', resolvedAt: '2026-01-01' }] }))).toBeUndefined();
  });

  it('accepts anyone else', () => {
    expect(notAbleReason(character({}))).toBeUndefined();
  });
});
