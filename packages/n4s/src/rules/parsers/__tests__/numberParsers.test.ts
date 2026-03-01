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

  it('clamp when min equals max', () => {
    expect(clamp(50, 10, 10).type).toBe(10);
  });

  it('clamp does not validate min <= max', () => {
    expect(clamp(50, 100, 0).type).toBe(0);
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

  it('toDate passes for numeric timestamp', () => {
    const result = toDate(1704067200000);

    expect(result.pass).toBe(true);
    expect(result.type instanceof Date).toBe(true);
    expect(result.type.toISOString()).toBe('2024-01-01T00:00:00.000Z');
  });

  it('toDate passes for Date instance', () => {
    const input = new Date('2024-01-01T00:00:00.000Z');
    const result = toDate(input);

    expect(result.pass).toBe(true);
    expect(result.type instanceof Date).toBe(true);
    expect(result.type.getTime()).toBe(input.getTime());
  });

  it('toDate fails for invalid values', () => {
    const result = toDate('not-a-date');

    expect(result.pass).toBe(false);
    expect(Number.isNaN(result.type.getTime())).toBe(true);
    expect(result.message).toBe('Could not parse to Date');
  });

  it('toDate fails for non-string/number/Date types', () => {
    const result = toDate({ year: 2024 });

    expect(result.pass).toBe(false);
    expect(result.message).toBe(
      'Could not parse to Date: expected string, number, or Date',
    );
  });

  it('toFloat passes', () => {
    const result = toFloat('10.5');

    expect(result.pass).toBe(true);
    expect(result.type).toBe(10.5);
  });

  it('toFloat passes for number input', () => {
    expect(toFloat(10.5).type).toBe(10.5);
    expect(toFloat(10.5).pass).toBe(true);
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

  it('toInteger passes for number input', () => {
    expect(toInteger(11.8).type).toBe(11);
    expect(toInteger(11.8).pass).toBe(true);
  });

  it('toInteger with binary radix', () => {
    expect(toInteger('1011', 2).type).toBe(11);
    expect(toInteger('1011', 2).pass).toBe(true);
  });

  it('toInteger fails', () => {
    const result = toInteger('abc');

    expect(result.pass).toBe(false);
    expect(Number.isNaN(result.type)).toBe(true);
    expect(result.message).toBe('Could not parse to integer');
  });

  it('toInteger fails for invalid radix', () => {
    const result = toInteger('10', 1);

    expect(result.pass).toBe(false);
    expect(result.message).toBe(
      'Invalid radix: must be an integer between 2 and 36',
    );
  });
});
