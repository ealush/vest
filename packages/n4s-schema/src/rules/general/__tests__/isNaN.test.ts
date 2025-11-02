import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNaN', () => {
  it('pass for NaN', () => {
    expect(enforceLazy.isNaN().run(NaN).pass).toBe(true);
  });

  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNaN().run(0).pass).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(enforceLazy.isNaN().run(1).pass).toBe(false);
      expect(enforceLazy.isNaN().run(42).pass).toBe(false);
      expect(enforceLazy.isNaN().run(3.14).pass).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(enforceLazy.isNaN().run(-1).pass).toBe(false);
      expect(enforceLazy.isNaN().run(-42).pass).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforceLazy.isNaN().run(Infinity).pass).toBe(false);
      expect(enforceLazy.isNaN().run(-Infinity).pass).toBe(false);
    });
  });

  describe('fails for non-number types', () => {
    it('fails for strings', () => {
      const nanStr: any = 'NaN';
      const text: any = 'text';
      const numStr: any = '123';
      expect(enforceLazy.isNaN().run(nanStr).pass).toBe(false);
      expect(enforceLazy.isNaN().run(text).pass).toBe(false);
      expect(enforceLazy.isNaN().run(numStr).pass).toBe(false);
    });

    it('fails for booleans', () => {
      expect(enforceLazy.isNaN().run(true).pass).toBe(false);
      expect(enforceLazy.isNaN().run(false).pass).toBe(false);
    });

    it('fails for objects', () => {
      expect(enforceLazy.isNaN().run({}).pass).toBe(false);
      expect(enforceLazy.isNaN().run({ a: 1 }).pass).toBe(false);
    });

    it('fails for arrays', () => {
      expect(enforceLazy.isNaN().run([]).pass).toBe(false);
      expect(enforceLazy.isNaN().run([1, 2]).pass).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforceLazy.isNaN().run(value).pass).toBe(false);
    });

    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNaN().run(value).pass).toBe(false);
    });
  });
});
