import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNumeric', () => {
  describe('fails for numeric values', () => {
    it('fails for numbers', () => {
      expect(enforceLazy.isNotNumeric().run(0).pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run(42).pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run(-1).pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run(3.14).pass).toBe(false);
    });

    it('fails for numeric strings', () => {
      expect(enforceLazy.isNotNumeric().run('0').pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run('42').pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run('-1').pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run('3.14').pass).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNotNumeric().run(Infinity).pass).toBe(false);
      expect(enforceLazy.isNotNumeric().run(-Infinity).pass).toBe(false);
    });
  });

  describe('pass for non-numeric values', () => {
    it('pass for NaN', () => {
      const nan: any = NaN;
      expect(enforceLazy.isNotNumeric().run(nan).pass).toBe(true);
    });

    it('pass for non-numeric strings', () => {
      expect(enforceLazy.isNotNumeric().run('a').pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run('hello').pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run('').pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run('NaN').pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforceLazy.isNotNumeric().run(true).pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforceLazy.isNotNumeric().run({}).pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforceLazy.isNotNumeric().run([]).pass).toBe(true);
      expect(enforceLazy.isNotNumeric().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNumeric().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNumeric().run(value).pass).toBe(true);
    });
  });
});
