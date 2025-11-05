import { describe, it, expect } from 'vitest';

import {
  transformResult,
  enforceMessage,
  validateResult,
  normalizeResult,
  type RuleDetailedResult,
} from 'ruleResult';

describe('ruleResult helpers', () => {
  describe('transformResult', () => {
    it('returns pass for boolean input (true/false)', () => {
      expect(transformResult(true, 'isTrue', 'x')).toEqual({ pass: true });
      expect(transformResult(false, 'isFalse', 'x')).toEqual({ pass: false });
    });

    it('extracts pass and resolves function message with dynamic args', () => {
      const res = transformResult(
        {
          pass: false,
          message: (rule: string, value: unknown, min: number) =>
            `${String(value)} failed ${rule}(${min})`,
        },
        'greaterThan',
        1,
        2,
      );
      expect(res.pass).toBe(false);
      expect(res.message).toBe('1 failed greaterThan(2)');
    });

    it('handles string message as-is', () => {
      const res = transformResult(
        { pass: false, message: 'Oops' },
        'anyRule',
        'value',
      );
      expect(res).toEqual({ pass: false, message: 'Oops' });
    });
  });

  describe('enforceMessage', () => {
    it('prefers custom message when provided', () => {
      const msg = enforceMessage(
        'rule',
        { pass: false } as RuleDetailedResult,
        'value',
        'Custom',
      );
      expect(String(msg)).toBe('Custom');
    });

    it('falls back to rule-provided message', () => {
      const msg = enforceMessage(
        'rule',
        { pass: false, message: 'FromRule' },
        'value',
      );
      expect(String(msg)).toBe('FromRule');
    });

    it('falls back to default composed message when none provided', () => {
      const msg = enforceMessage('equals', { pass: false }, 'abc');
      expect(String(msg)).toBe('enforce/equals failed with "abc"');
    });
  });

  describe('validateResult', () => {
    it('accepts boolean and object with boolean pass', () => {
      expect(() => validateResult(true)).not.toThrow();
      expect(() => validateResult({ pass: false })).not.toThrow();
    });

    it('throws on invalid result shapes', () => {
      expect(() => validateResult(undefined)).toThrow();
      expect(() => validateResult(null)).toThrow();
      expect(() => validateResult({})).toThrow();
      expect(() => validateResult({ pass: 'nope' })).toThrow();
    });
  });

  describe('normalizeResult', () => {
    it('returns boolean as-is', () => {
      expect(normalizeResult(true)).toBe(true);
      expect(normalizeResult(false)).toBe(false);
    });

    it('extracts pass property from object', () => {
      expect(normalizeResult({ pass: true })).toBe(true);
      expect(normalizeResult({ pass: false })).toBe(false);
    });

    it('returns false for invalid inputs', () => {
      expect(normalizeResult(undefined)).toBe(false);
      expect(normalizeResult({})).toBe(false);
    });
  });
});
