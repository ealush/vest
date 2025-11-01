import { describe, it, expect } from 'vitest';

import { isNotNaN } from '../general/isNotNaN';

describe('isNotNaN', () => {
  it('fails for NaN', () => {
    expect(isNotNaN().run(NaN).passes).toBe(false);
  });

  describe('passes for numbers', () => {
    it('passes for zero', () => {
      expect(isNotNaN().run(0).passes).toBe(true);
    });

    it('passes for positive numbers', () => {
      expect(isNotNaN().run(1).passes).toBe(true);
      expect(isNotNaN().run(42).passes).toBe(true);
      expect(isNotNaN().run(3.14).passes).toBe(true);
    });

    it('passes for negative numbers', () => {
      expect(isNotNaN().run(-1).passes).toBe(true);
      expect(isNotNaN().run(-42).passes).toBe(true);
    });

    it('passes for Infinity', () => {
      expect(isNotNaN().run(Infinity).passes).toBe(true);
      expect(isNotNaN().run(-Infinity).passes).toBe(true);
    });
  });

  describe('passes for non-number types', () => {
    it('passes for strings', () => {
      const text: any = 'text';
      const numStr: any = '123';
      expect(isNotNaN().run(text).passes).toBe(true);
      expect(isNotNaN().run(numStr).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(isNotNaN().run(true).passes).toBe(true);
      expect(isNotNaN().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(isNotNaN().run({}).passes).toBe(true);
      expect(isNotNaN().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(isNotNaN().run([]).passes).toBe(true);
      expect(isNotNaN().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isNotNaN().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isNotNaN().run(value).passes).toBe(true);
    });
  });
});
