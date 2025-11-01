import { describe, it, expect } from 'vitest';

import { isNaN } from '../isNaN';

describe('isNaN', () => {
  it('passes for NaN', () => {
    expect(isNaN().run(NaN).passes).toBe(true);
  });

  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(isNaN().run(0).passes).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(isNaN().run(1).passes).toBe(false);
      expect(isNaN().run(42).passes).toBe(false);
      expect(isNaN().run(3.14).passes).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(isNaN().run(-1).passes).toBe(false);
      expect(isNaN().run(-42).passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(isNaN().run(Infinity).passes).toBe(false);
      expect(isNaN().run(-Infinity).passes).toBe(false);
    });
  });

  describe('fails for non-number types', () => {
    it('fails for strings', () => {
      const nanStr: any = 'NaN';
      const text: any = 'text';
      const numStr: any = '123';
      expect(isNaN().run(nanStr).passes).toBe(false);
      expect(isNaN().run(text).passes).toBe(false);
      expect(isNaN().run(numStr).passes).toBe(false);
    });

    it('fails for booleans', () => {
      expect(isNaN().run(true).passes).toBe(false);
      expect(isNaN().run(false).passes).toBe(false);
    });

    it('fails for objects', () => {
      expect(isNaN().run({}).passes).toBe(false);
      expect(isNaN().run({ a: 1 }).passes).toBe(false);
    });

    it('fails for arrays', () => {
      expect(isNaN().run([]).passes).toBe(false);
      expect(isNaN().run([1, 2]).passes).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(isNaN().run(value).passes).toBe(false);
    });

    it('fails for undefined', () => {
      const value: any = undefined;
      expect(isNaN().run(value).passes).toBe(false);
    });
  });
});
