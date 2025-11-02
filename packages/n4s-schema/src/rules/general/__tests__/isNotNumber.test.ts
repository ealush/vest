import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNumber', () => {
  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNotNumber().run(0).pass).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(enforceLazy.isNotNumber().run(1).pass).toBe(false);
      expect(enforceLazy.isNotNumber().run(42).pass).toBe(false);
      expect(enforceLazy.isNotNumber().run(3.14).pass).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(enforceLazy.isNotNumber().run(-1).pass).toBe(false);
      expect(enforceLazy.isNotNumber().run(-42).pass).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNotNumber().run(Infinity).pass).toBe(false);
      expect(enforceLazy.isNotNumber().run(-Infinity).pass).toBe(false);
    });
  });

  describe('pass for non-number types', () => {
    it('pass for NaN', () => {
      expect(enforceLazy.isNotNumber().run(NaN).pass).toBe(true);
    });

    it('pass for numeric strings', () => {
      const str: any = '123';
      const float: any = '3.14';
      expect(enforceLazy.isNotNumber().run(str).pass).toBe(true);
      expect(enforceLazy.isNotNumber().run(float).pass).toBe(true);
    });

    it('pass for non-numeric strings', () => {
      const text: any = 'a';
      const empty: any = '';
      expect(enforceLazy.isNotNumber().run(text).pass).toBe(true);
      expect(enforceLazy.isNotNumber().run(empty).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforceLazy.isNotNumber().run(true).pass).toBe(true);
      expect(enforceLazy.isNotNumber().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforceLazy.isNotNumber().run({}).pass).toBe(true);
      expect(enforceLazy.isNotNumber().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforceLazy.isNotNumber().run([]).pass).toBe(true);
      expect(enforceLazy.isNotNumber().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNumber().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNumber().run(value).pass).toBe(true);
    });
  });
});
