import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNotNumber', () => {
  describe('fails for numbers', () => {
    it('fails for zero', () => {
      expect(enforce.isNotNumber().run(0).pass).toBe(false);
    });

    it('fails for positive numbers', () => {
      expect(enforce.isNotNumber().run(1).pass).toBe(false);
      expect(enforce.isNotNumber().run(42).pass).toBe(false);
      expect(enforce.isNotNumber().run(3.14).pass).toBe(false);
    });

    it('fails for negative numbers', () => {
      expect(enforce.isNotNumber().run(-1).pass).toBe(false);
      expect(enforce.isNotNumber().run(-42).pass).toBe(false);
    });

    it('fails for Infinity', () => {
      expect(enforce.isNotNumber().run(Infinity).pass).toBe(false);
      expect(enforce.isNotNumber().run(-Infinity).pass).toBe(false);
    });
  });

  describe('pass for non-number types', () => {
    it('pass for NaN', () => {
      expect(enforce.isNotNumber().run(NaN).pass).toBe(true);
    });

    it('pass for numeric strings', () => {
      const str: any = '123';
      const float: any = '3.14';
      expect(enforce.isNotNumber().run(str).pass).toBe(true);
      expect(enforce.isNotNumber().run(float).pass).toBe(true);
    });

    it('pass for non-numeric strings', () => {
      const text: any = 'a';
      const empty: any = '';
      expect(enforce.isNotNumber().run(text).pass).toBe(true);
      expect(enforce.isNotNumber().run(empty).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforce.isNotNumber().run(true).pass).toBe(true);
      expect(enforce.isNotNumber().run(false).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforce.isNotNumber().run({}).pass).toBe(true);
      expect(enforce.isNotNumber().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforce.isNotNumber().run([]).pass).toBe(true);
      expect(enforce.isNotNumber().run([1, 2]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotNumber().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotNumber().run(value).pass).toBe(true);
    });
  });
});
