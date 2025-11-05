import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNotNaN', () => {
  it('fails for NaN', () => {
    expect(enforce.isNotNaN().run(NaN).pass).toBe(false);
  });

  describe('pass for numbers', () => {
    it('pass for zero', () => {
      expect(enforce.isNotNaN().run(0).pass).toBe(true);
    });

    it('pass for positive numbers', () => {
      expect(enforce.isNotNaN().run(1).pass).toBe(true);
      expect(enforce.isNotNaN().run(42).pass).toBe(true);
      expect(enforce.isNotNaN().run(3.14).pass).toBe(true);
    });

    it('pass for negative numbers', () => {
      expect(enforce.isNotNaN().run(-1).pass).toBe(true);
      expect(enforce.isNotNaN().run(-42).pass).toBe(true);
    });

    it('pass for Infinity', () => {
      expect(enforce.isNotNaN().run(Infinity).pass).toBe(true);
      expect(enforce.isNotNaN().run(-Infinity).pass).toBe(true);
    });
  });

  describe('pass for non-number types', () => {
    it('pass for strings', () => {
      const text: any = 'text';
      const numStr: any = '123';
      expect(enforce.isNotNaN().run(text).pass).toBe(true);
      expect(enforce.isNotNaN().run(numStr).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforce.isNotNaN().run(true).pass).toBe(true);
      expect(enforce.isNotNaN().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforce.isNotNaN().run({}).pass).toBe(true);
      expect(enforce.isNotNaN().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforce.isNotNaN().run([]).pass).toBe(true);
      expect(enforce.isNotNaN().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotNaN().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotNaN().run(value).pass).toBe(true);
    });
  });
});
