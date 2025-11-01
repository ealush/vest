import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNaN', () => {
  it('passes for NaN', () => {
    expect(enforceLazy.isNaN().run(NaN).passes).toBe(true);
  });

  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNaN().run(0).passes).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(enforceLazy.isNaN().run(1).passes).toBe(false);
      expect(enforceLazy.isNaN().run(42).passes).toBe(false);
      expect(enforceLazy.isNaN().run(3.14).passes).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(enforceLazy.isNaN().run(-1).passes).toBe(false);
      expect(enforceLazy.isNaN().run(-42).passes).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNaN().run(Infinity).passes).toBe(false);
      expect(enforceLazy.isNaN().run(-Infinity).passes).toBe(false);
    });
  });

  describe('fails for non-number types', () => {
    it('fails for strings', () => {
      const nanStr: any = 'NaN';
      const text: any = 'text';
      const numStr: any = '123';
      expect(enforceLazy.isNaN().run(nanStr).passes).toBe(false);
      expect(enforceLazy.isNaN().run(text).passes).toBe(false);
      expect(enforceLazy.isNaN().run(numStr).passes).toBe(false);
    });

    it('fails for booleans', () => {
      expect(enforceLazy.isNaN().run(true).passes).toBe(false);
      expect(enforceLazy.isNaN().run(false).passes).toBe(false);
    });

    it('fails for objects', () => {
      expect(enforceLazy.isNaN().run({}).passes).toBe(false);
      expect(enforceLazy.isNaN().run({ a: 1 }).passes).toBe(false);
    });

    it('fails for arrays', () => {
      expect(enforceLazy.isNaN().run([]).passes).toBe(false);
      expect(enforceLazy.isNaN().run([1, 2]).passes).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforceLazy.isNaN().run(value).passes).toBe(false);
    });

    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNaN().run(value).passes).toBe(false);
    });
  });
});
