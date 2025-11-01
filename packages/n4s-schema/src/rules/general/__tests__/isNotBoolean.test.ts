import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('isNotBoolean', () => {
  it('fails for booleans', () => {
    expect(enforceLazy.isNotBoolean().run(true).passes).toBe(false);
    expect(enforceLazy.isNotBoolean().run(false).passes).toBe(false);
  });

  describe('passes for non-boolean types', () => {
    it('passes for numbers', () => {
      expect(enforceLazy.isNotBoolean().run(0).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(1).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(42).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(NaN).passes).toBe(true);
    });

    it('passes for strings', () => {
      const text: any = 'a';
      const empty: any = '';
      const truthy: any = 'true';
      const falsy: any = 'false';
      expect(enforceLazy.isNotBoolean().run(text).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(empty).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(truthy).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run(falsy).passes).toBe(true);
    });

    it('passes for objects', () => {
      expect(enforceLazy.isNotBoolean().run({}).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run({ a: 1 }).passes).toBe(true);
    });

    it('passes for arrays', () => {
      expect(enforceLazy.isNotBoolean().run([]).passes).toBe(true);
      expect(enforceLazy.isNotBoolean().run([true, false]).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotBoolean().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotBoolean().run(value).passes).toBe(true);
    });

    it('passes for functions', () => {
      const fn: any = () => true;
      expect(enforceLazy.isNotBoolean().run(fn).passes).toBe(true);
    });
  });
});
