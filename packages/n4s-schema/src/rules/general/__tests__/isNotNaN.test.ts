import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNaN', () => {
  it('fails for NaN', () => {
    expect(enforceLazy.isNotNaN().run(NaN).passes).toBe(false);
  });

  describe('passes for numbers', () => {
    it('passes for zero', () => {
      expect(enforceLazy.isNotNaN().run(0).passes).toBe(true);
    });

    it('passes for positive numbers', () => {
      expect(enforceLazy.isNotNaN().run(1).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(42).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(3.14).passes).toBe(true);
    });

    it('passes for negative numbers', () => {
      expect(enforceLazy.isNotNaN().run(-1).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(-42).passes).toBe(true);
    });

    it('passes for Infinity', () => {
      expect(enforceLazy.isNotNaN().run(Infinity).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(-Infinity).passes).toBe(true);
    });
  });

  describe('passes for non-number types', () => {
    it('passes for strings', () => {
      const text: any = 'text';
      const numStr: any = '123';
      expect(enforceLazy.isNotNaN().run(text).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(numStr).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(enforceLazy.isNotNaN().run(true).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run(false).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(enforceLazy.isNotNaN().run({}).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(enforceLazy.isNotNaN().run([]).passes).toBe(true);
      expect(enforceLazy.isNotNaN().run([1, 2]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNaN().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNaN().run(value).passes).toBe(true);
    });
  });
});
