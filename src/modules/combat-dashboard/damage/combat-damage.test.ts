import { describe, expect, it } from 'vitest';
import { barShare } from './combat-damage';

describe('barShare', () => {
  it('is the part of the scale the value fills', () => {
    expect(barShare(20, 80)).toBe(0.25);
    expect(barShare(80, 80)).toBe(1);
  });

  it('never goes past the scale nor below zero', () => {
    expect(barShare(120, 80)).toBe(1);
    expect(barShare(-5, 80)).toBe(0);
  });

  it('is empty without a scale', () => {
    expect(barShare(20, 0)).toBe(0);
    expect(barShare(20, null)).toBe(0);
    expect(barShare(20, undefined)).toBe(0);
  });
});
