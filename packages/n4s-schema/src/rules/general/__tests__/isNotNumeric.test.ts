import { describe, it, expect } from 'vitest';

import { isNotNumeric } from '../isNotNumeric';

describe('isNotNumeric', () => {
  describe('fails for numeric values', () => {
    it('fails for numbers', () => {
      expect(isNotNumeric().run(0).passes).toBe(false);
      expect(isNotNumeric().run(42).passes).toBe(false);
      expect(isNotNumeric().run(-1).passes).toBe(false);
      expect(isNotNumeric().run(3.14).passes).toBe(false);
    });

    it('fails for numeric strings', () => {
      expect(isNotNumeric().run('0').passes).toBe(false);
      expect(isNotNumeric().run('42').passes).toBe(false);
      expect(isNotNumeric().run('-1').passes).toBe(false);
      expect(isNotNumeric().run('3.14').passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(isNotNumeric().run(Infinity).passes).toBe(false);
      expect(isNotNumeric().run(-Infinity).passes).toBe(false);
    });
  });

  describe('passes for non-numeric values', () => {
    it('passes for NaN', () => {
      const nan: any = NaN;
      expect(isNotNumeric().run(nan).passes).toBe(true);
    });

    it('passes for non-numeric strings', () => {
      expect(isNotNumeric().run('a').passes).toBe(true);
      expect(isNotNumeric().run('hello').passes).toBe(true);
      expect(isNotNumeric().run('').passes).toBe(true);
      expect(isNotNumeric().run('NaN').passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(isNotNumeric().run(true).passes).toBe(true);
      expect(isNotNumeric().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(isNotNumeric().run({}).passes).toBe(true);
      expect(isNotNumeric().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(isNotNumeric().run([]).passes).toBe(true);
      expect(isNotNumeric().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isNotNumeric().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isNotNumeric().run(value).passes).toBe(true);
    });
  });
});
