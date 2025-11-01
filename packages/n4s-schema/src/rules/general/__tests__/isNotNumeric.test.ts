import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNumeric', () => {
  describe('fails for numeric values', () => {
    it('fails for numbers', () => {
      expect(enforceLazy.isNotNumeric().run(0).passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run(42).passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run(-1).passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run(3.14).passes).toBe(false);
    });

    it('fails for numeric strings', () => {
      expect(enforceLazy.isNotNumeric().run('0').passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run('42').passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run('-1').passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run('3.14').passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNotNumeric().run(Infinity).passes).toBe(false);
      expect(enforceLazy.isNotNumeric().run(-Infinity).passes).toBe(false);
    });
  });

  describe('passes for non-numeric values', () => {
    it('passes for NaN', () => {
      const nan: any = NaN;
      expect(enforceLazy.isNotNumeric().run(nan).passes).toBe(true);
    });

    it('passes for non-numeric strings', () => {
      expect(enforceLazy.isNotNumeric().run('a').passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run('hello').passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run('').passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run('NaN').passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(enforceLazy.isNotNumeric().run(true).passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(enforceLazy.isNotNumeric().run({}).passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(enforceLazy.isNotNumeric().run([]).passes).toBe(true);
      expect(enforceLazy.isNotNumeric().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNumeric().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNumeric().run(value).passes).toBe(true);
    });
  });
});
