import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('isNotBoolean', () => {
  it('fails for booleans', () => {
    expect(enforce.isNotBoolean().run(true).pass).toBe(false);
    expect(enforce.isNotBoolean().run(false).pass).toBe(false);
  });

  describe('pass for non-boolean types', () => {
    it('pass for numbers', () => {
      expect(enforce.isNotBoolean().run(0).pass).toBe(true);
      expect(enforce.isNotBoolean().run(1).pass).toBe(true);
      expect(enforce.isNotBoolean().run(42).pass).toBe(true);
      expect(enforce.isNotBoolean().run(NaN).pass).toBe(true);
    });

    it('pass for strings', () => {
      const text: any = 'a';
      const empty: any = '';
      const truthy: any = 'true';
      const falsy: any = 'false';
      expect(enforce.isNotBoolean().run(text).pass).toBe(true);
      expect(enforce.isNotBoolean().run(empty).pass).toBe(true);
      expect(enforce.isNotBoolean().run(truthy).pass).toBe(true);
      expect(enforce.isNotBoolean().run(falsy).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforce.isNotBoolean().run({}).pass).toBe(true);
      expect(enforce.isNotBoolean().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforce.isNotBoolean().run([]).pass).toBe(true);
      expect(enforce.isNotBoolean().run([true, false]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotBoolean().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotBoolean().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => true;
      expect(enforce.isNotBoolean().run(fn).pass).toBe(true);
    });
  });
});
