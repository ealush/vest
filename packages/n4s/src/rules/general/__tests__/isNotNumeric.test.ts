import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNotNumeric', () => {
  describe('fails for numeric values', () => {
    it('fails for numbers', () => {
      expect(enforce.isNotNumeric().run(0).pass).toBe(false);
      expect(enforce.isNotNumeric().run(42).pass).toBe(false);
      expect(enforce.isNotNumeric().run(-1).pass).toBe(false);
      expect(enforce.isNotNumeric().run(3.14).pass).toBe(false);
    });

    it('fails for numeric strings', () => {
      expect(enforce.isNotNumeric().run('0').pass).toBe(false);
      expect(enforce.isNotNumeric().run('42').pass).toBe(false);
      expect(enforce.isNotNumeric().run('-1').pass).toBe(false);
      expect(enforce.isNotNumeric().run('3.14').pass).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforce.isNotNumeric().run(Infinity).pass).toBe(false);
      expect(enforce.isNotNumeric().run(-Infinity).pass).toBe(false);
    });
  });

  describe('pass for non-numeric values', () => {
    it('pass for NaN', () => {
      const nan: any = NaN;
      expect(enforce.isNotNumeric().run(nan).pass).toBe(true);
    });

    it('pass for non-numeric strings', () => {
      expect(enforce.isNotNumeric().run('a').pass).toBe(true);
      expect(enforce.isNotNumeric().run('hello').pass).toBe(true);
      expect(enforce.isNotNumeric().run('').pass).toBe(true);
      expect(enforce.isNotNumeric().run('NaN').pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforce.isNotNumeric().run(true).pass).toBe(true);
      expect(enforce.isNotNumeric().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforce.isNotNumeric().run({}).pass).toBe(true);
      expect(enforce.isNotNumeric().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforce.isNotNumeric().run([]).pass).toBe(true);
      expect(enforce.isNotNumeric().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotNumeric().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotNumeric().run(value).pass).toBe(true);
    });
  });
});
