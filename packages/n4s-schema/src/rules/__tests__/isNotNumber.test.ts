import { describe, it, expect } from 'vitest';

import { isNotNumber } from '../general/isNotNumber';

describe('isNotNumber', () => {
  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(isNotNumber().run(0).passes).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(isNotNumber().run(1).passes).toBe(false);
      expect(isNotNumber().run(42).passes).toBe(false);
      expect(isNotNumber().run(3.14).passes).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(isNotNumber().run(-1).passes).toBe(false);
      expect(isNotNumber().run(-42).passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(isNotNumber().run(Infinity).passes).toBe(false);
      expect(isNotNumber().run(-Infinity).passes).toBe(false);
    });
  });

  describe('passes for non-number types', () => {
    it('passes for NaN', () => {
      expect(isNotNumber().run(NaN).passes).toBe(true);
    });

    it('passes for numeric strings', () => {
      const str: any = '123';
      const float: any = '3.14';
      expect(isNotNumber().run(str).passes).toBe(true);
      expect(isNotNumber().run(float).passes).toBe(true);
    });

    it('passes for non-numeric strings', () => {
      const text: any = 'a';
      const empty: any = '';
      expect(isNotNumber().run(text).passes).toBe(true);
      expect(isNotNumber().run(empty).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(isNotNumber().run(true).passes).toBe(true);
      expect(isNotNumber().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(isNotNumber().run({}).passes).toBe(true);
      expect(isNotNumber().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(isNotNumber().run([]).passes).toBe(true);
      expect(isNotNumber().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isNotNumber().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isNotNumber().run(value).passes).toBe(true);
    });
  });
});
