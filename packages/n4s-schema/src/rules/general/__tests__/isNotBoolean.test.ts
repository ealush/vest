import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotBoolean', () => {
  it('fails for booleans', () => {
    expect(enforceLazy.isNotBoolean().run(true).pass).toBe(false);
    expect(enforceLazy.isNotBoolean().run(false).pass).toBe(false);
  });

  describe('pass for non-boolean types', () => {
    it('pass for numbers', () => {
      expect(enforceLazy.isNotBoolean().run(0).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(1).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(42).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(NaN).pass).toBe(true);
    });

    it('pass for strings', () => {
      const text: any = 'a';
      const empty: any = '';
      const truthy: any = 'true';
      const falsy: any = 'false';
      expect(enforceLazy.isNotBoolean().run(text).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(empty).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(truthy).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run(falsy).pass).toBe(true);
    });

    it('pass for objects', () => {
      expect(enforceLazy.isNotBoolean().run({}).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run({ a: 1 }).pass).toBe(true);
    });

    it('pass for arrays', () => {
      expect(enforceLazy.isNotBoolean().run([]).pass).toBe(true);
      expect(enforceLazy.isNotBoolean().run([true, false]).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotBoolean().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotBoolean().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => true;
      expect(enforceLazy.isNotBoolean().run(fn).pass).toBe(true);
    });
  });
});
