import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotArray', () => {
  it('fails for arrays', () => {
    expect(enforceLazy.isNotArray().run([]).passes).toBe(false);
    expect(enforceLazy.isNotArray().run([1, 2, 3]).passes).toBe(false);
    expect(enforceLazy.isNotArray().run([null, undefined]).passes).toBe(false);
  });

  describe('passes for non-array types', () => {
    it('passes for objects', () => {
      expect(enforceLazy.isNotArray().run({}).passes).toBe(true);
      expect(enforceLazy.isNotArray().run({ a: 1 }).passes).toBe(true);
      expect(enforceLazy.isNotArray().run({ length: 3 }).passes).toBe(true);
    });

    it('passes for numbers', () => {
      expect(enforceLazy.isNotArray().run(0).passes).toBe(true);
      expect(enforceLazy.isNotArray().run(42).passes).toBe(true);
      expect(enforceLazy.isNotArray().run(-1).passes).toBe(true);
      expect(enforceLazy.isNotArray().run(NaN).passes).toBe(true);
    });

    it('passes for strings', () => {
      const str: any = 'text';
      const empty: any = '';
      expect(enforceLazy.isNotArray().run(str).passes).toBe(true);
      expect(enforceLazy.isNotArray().run(empty).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(enforceLazy.isNotArray().run(true).passes).toBe(true);
      expect(enforceLazy.isNotArray().run(false).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotArray().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotArray().run(value).passes).toBe(true);
    });

    it('passes for functions', () => {
      const fn: any = () => {};
      expect(enforceLazy.isNotArray().run(fn).passes).toBe(true);
    });
  });
});
