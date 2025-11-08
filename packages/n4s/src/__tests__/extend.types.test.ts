/**
 * Type tests for custom rule extensions via n4s namespace.
 * This file uses TypeScript's type system to ensure proper type safety.
 */

/* eslint-disable sort-keys, @typescript-eslint/no-namespace, @typescript-eslint/no-unused-vars, no-unused-vars */
import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from 'n4s';

// Declare custom rules in the n4s namespace
declare global {
  namespace n4s {
    interface ValueFirstRules {
      isPositive: (value: number) => boolean;
      isEmail: (value: string) => boolean | { pass: boolean; message?: string };
      isBetween: (value: number, min: number, max: number) => boolean;
      hasLength: (value: string, length: number) => boolean;
    }
  }
}

describe('enforce.extend with n4s namespace typing', () => {
  beforeEach(() => {
    enforce.extend({
      isPositive: (value: number) => value > 0,
      isEmail: (value: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || {
          pass: false,
          message: 'Invalid email format',
        },
      isBetween: (value: number, min: number, max: number) =>
        value >= min && value <= max,
      hasLength: (value: string, length: number) => value.length === length,
    });
  });

  describe('Eager mode with custom rules', () => {
    it('Should work with isPositive (passing)', () => {
      expect(() => enforce(5).isPositive()).not.toThrow();
    });

    it('Should work with isPositive (failing)', () => {
      expect(() => enforce(-1).isPositive()).toThrow();
    });

    it('Should work with isEmail (passing)', () => {
      expect(() => enforce('user@example.com').isEmail()).not.toThrow();
    });

    it('Should work with isEmail (failing)', () => {
      expect(() => enforce('invalid-email').isEmail()).toThrow();
    });

    it('Should work with isBetween (passing)', () => {
      expect(() => enforce(5).isBetween(1, 10)).not.toThrow();
    });

    it('Should work with isBetween (failing)', () => {
      expect(() => enforce(15).isBetween(1, 10)).toThrow();
    });

    it('Should work with hasLength (passing)', () => {
      expect(() => enforce('hello').hasLength(5)).not.toThrow();
    });

    it('Should work with hasLength (failing)', () => {
      expect(() => enforce('hello').hasLength(3)).toThrow();
    });

    it('Should work with custom message', () => {
      expect(() =>
        enforce(-1).message('Value must be positive').isPositive(),
      ).toThrow('Value must be positive');
    });
  });

  describe('Lazy mode with custom rules', () => {
    it('Should work with isPositive', () => {
      const rule = enforce.isPositive();
      expect(rule.run(5)).toEqual({ pass: true, type: 5 });
      expect(rule.run(-1)).toEqual({ pass: false, type: -1 });
    });

    it('Should work with isEmail', () => {
      const rule = enforce.isEmail();
      expect(rule.run('user@example.com')).toEqual({
        pass: true,
        type: 'user@example.com',
      });
      expect(rule.run('invalid')).toEqual({
        pass: false,
        type: 'invalid',
        message: 'Invalid email format',
      });
    });

    it('Should work with isBetween', () => {
      const rule = enforce.isBetween(1, 10);
      expect(rule.run(5)).toEqual({ pass: true, type: 5 });
      expect(rule.run(15)).toEqual({ pass: false, type: 15 });
    });

    it('Should work with hasLength', () => {
      const rule = enforce.hasLength(5);
      expect(rule.run('hello')).toEqual({ pass: true, type: 'hello' });
      expect(rule.run('hi')).toEqual({ pass: false, type: 'hi' });
    });
  });

  describe('Chaining with built-in rules', () => {
    it('Should chain custom rules with built-in rules', () => {
      const rule = enforce.isNumber().isPositive().isBetween(1, 100);
      expect(rule.run(50)).toEqual({ pass: true, type: 50 });
      expect(rule.run(-5)).toEqual({ pass: false, type: -5 });
      expect(rule.run(150)).toEqual({ pass: false, type: 150 });
    });

    it('Should chain built-in rules with custom rules', () => {
      const rule = enforce.isString().hasLength(5);
      expect(rule.run('hello')).toEqual({ pass: true, type: 'hello' });
      expect(rule.run('hi')).toEqual({ pass: false, type: 'hi' });
    });
  });
});
