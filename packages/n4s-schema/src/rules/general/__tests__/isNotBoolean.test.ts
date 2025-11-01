import { describe, it, expect } from 'vitest';

import { isNotBoolean } from '../isNotBoolean';

describe('isNotBoolean', () => {
  it('fails for booleans', () => {
    expect(isNotBoolean().run(true).passes).toBe(false);
    expect(isNotBoolean().run(false).passes).toBe(false);
  });

  describe('passes for non-boolean types', () => {
    it('passes for numbers', () => {
      expect(isNotBoolean().run(0).passes).toBe(true);
      expect(isNotBoolean().run(1).passes).toBe(true);
      expect(isNotBoolean().run(42).passes).toBe(true);
      expect(isNotBoolean().run(NaN).passes).toBe(true);
    });

    it('passes for strings', () => {
      const text: any = 'a';
      const empty: any = '';
      const truthy: any = 'true';
      const falsy: any = 'false';
      expect(isNotBoolean().run(text).passes).toBe(true);
      expect(isNotBoolean().run(empty).passes).toBe(true);
      expect(isNotBoolean().run(truthy).passes).toBe(true);
      expect(isNotBoolean().run(falsy).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(isNotBoolean().run({}).passes).toBe(true);
      expect(isNotBoolean().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(isNotBoolean().run([]).passes).toBe(true);
      expect(isNotBoolean().run([true, false]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isNotBoolean().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isNotBoolean().run(value).passes).toBe(true);
    });

    it('passes for functions', () => {
      const fn: any = () => true;
      expect(isNotBoolean().run(fn).passes).toBe(true);
    });
  });
});
