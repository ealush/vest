import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotNaN', () => {
  it('fails for NaN', () => {
    expect(enforceLazy.isNotNaN().run(NaN).pass).toBe(false);
  });

  describe('pass for numbers', () => {
    it('pass for zero', () => {
      expect(enforceLazy.isNotNaN().run(0).pass).toBe(true);
    });

    it('pass for positive numbers', () => {
      expect(enforceLazy.isNotNaN().run(1).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(42).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(3.14).pass).toBe(true);
    });

    it('pass for negative numbers', () => {
      expect(enforceLazy.isNotNaN().run(-1).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(-42).pass).toBe(true);
    });

    it('pass for Infinity', () => {
      expect(enforceLazy.isNotNaN().run(Infinity).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(-Infinity).pass).toBe(true);
    });
  });

  describe('pass for non-number types', () => {
    it('pass for strings', () => {
      const text: any = 'text';
      const numStr: any = '123';
      expect(enforceLazy.isNotNaN().run(text).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(numStr).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforceLazy.isNotNaN().run(true).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforceLazy.isNotNaN().run({}).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforceLazy.isNotNaN().run([]).pass).toBe(true);
      expect(enforceLazy.isNotNaN().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotNaN().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotNaN().run(value).pass).toBe(true);
    });
  });
});
