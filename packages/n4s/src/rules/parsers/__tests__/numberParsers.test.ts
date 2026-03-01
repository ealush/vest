import { describe, expect, it } from 'vitest';

import {
  ceil,
  clamp,
  floor,
  numberParsers,
  round,
  toAbsolute,
  toDate,
  toFloat,
  toInteger,
} from '../numberParsers';

describe('number parsers', () => {
  it('exports all number parser functions', () => {
    expect(Object.keys(numberParsers).sort()).toEqual([
      'ceil',
      'clamp',
      'floor',
      'round',
      'toAbsolute',
      'toDate',
      'toFloat',
      'toInteger',
    ]);
  });

  it('ceil', () => {
    expect(ceil(2.1).type).toBe(3);
  });

  it('clamp', () => {
    expect(clamp(120, 0, 100).type).toBe(100);
  });

  it('floor', () => {
    expect(floor(2.9).type).toBe(2);
  });

  it('round', () => {
    expect(round(2.5).type).toBe(3);
  });

  it('toAbsolute', () => {
    expect(toAbsolute(-15).type).toBe(15);
  });

  it('toDate passes for date-like values', () => {
    const result = toDate('2024-01-01T00:00:00.000Z');

    expect(result.pass).toBe(true);
    expect(result.type instanceof Date).toBe(true);
  });

  it('toDate fails for invalid values', () => {
    const result = toDate('not-a-date');

    expect(result.pass).toBe(false);
    expect(Number.isNaN(result.type.getTime())).toBe(true);
    expect(result.message).toBe('Could not parse to Date');
  });

  it('toFloat passes', () => {
    expect(toFloat('10.5')).toEqual({
      pass: true,
      type: 10.5,
      message: undefined,
      path: undefined,
    });
  });

  it('toFloat fails', () => {
    const result = toFloat('abc');

    expect(result.pass).toBe(false);
    expect(Number.isNaN(result.type)).toBe(true);
    expect(result.message).toBe('Could not parse to float');
  });

  it('toInteger passes', () => {
    expect(toInteger('11.8').type).toBe(11);
  });

  it('toInteger fails', () => {
    const result = toInteger('abc');

    expect(result.pass).toBe(false);
    expect(Number.isNaN(result.type)).toBe(true);
    expect(result.message).toBe('Could not parse to integer');
  });
});
