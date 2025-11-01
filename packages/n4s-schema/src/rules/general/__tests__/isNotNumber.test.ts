import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNotNumber', () => {
  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNotNumber().run(0).passes).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(enforceLazy.isNotNumber().run(1).passes).toBe(false);
      expect(enforceLazy.isNotNumber().run(42).passes).toBe(false);
      expect(enforceLazy.isNotNumber().run(3.14).passes).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(enforceLazy.isNotNumber().run(-1).passes).toBe(false);
      expect(enforceLazy.isNotNumber().run(-42).passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNotNumber().run(Infinity).passes).toBe(false);
      expect(enforceLazy.isNotNumber().run(-Infinity).passes).toBe(false);
    });
  });

  describe('passes for non-number types', () => {
    it('passes for NaN', () => {
      expect(enforceLazy.isNotNumber().run(NaN).passes).toBe(true);
    });

    it('passes for numeric strings', () => {
      const str: any = '123';
      const float: any = '3.14';
      expect(enforceLazy.isNotNumber().run(str).passes).toBe(true);
      expect(enforceLazy.isNotNumber().run(float).passes).toBe(true);
    });

    it('passes for non-numeric strings', () => {
      const text: any = 'a';
      const empty: any = '';
      expect(enforceLazy.isNotNumber().run(text).passes).toBe(true);
      expect(enforceLazy.isNotNumber().run(empty).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(enforceLazy.isNotNumber().run(true).passes).toBe(true);
      expect(enforceLazy.isNotNumber().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(enforceLazy.isNotNumber().run({}).passes).toBe(true);
      expect(enforceLazy.isNotNumber().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(enforceLazy.isNotNumber().run([]).passes).toBe(true);
      expect(enforceLazy.isNotNumber().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNumber().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNumber().run(value).passes).toBe(true);
    });
  });
});
