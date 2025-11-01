import { describe, it, expect } from 'vitest';

import { isNotArray } from '../../general/isNotArray';

describe('isNotArray', () => {
  it('fails for arrays', () => {
    expect(isNotArray().run([]).passes).toBe(false);
    expect(isNotArray().run([1, 2, 3]).passes).toBe(false);
    expect(isNotArray().run([null, undefined]).passes).toBe(false);
  });

  describe('passes for non-array types', () => {
    it('passes for objects', () => {
      expect(isNotArray().run({}).passes).toBe(true);
      expect(isNotArray().run({ a: 1 }).passes).toBe(true);
      expect(isNotArray().run({ length: 3 }).passes).toBe(true);
    });

    it('passes for numbers', () => {
      expect(isNotArray().run(0).passes).toBe(true);
      expect(isNotArray().run(42).passes).toBe(true);
      expect(isNotArray().run(-1).passes).toBe(true);
      expect(isNotArray().run(NaN).passes).toBe(true);
    });

    it('passes for strings', () => {
      const str: any = 'text';
      const empty: any = '';
      expect(isNotArray().run(str).passes).toBe(true);
      expect(isNotArray().run(empty).passes).toBe(true);
    });

    it('passes for booleans', () => {
      expect(isNotArray().run(true).passes).toBe(true);
      expect(isNotArray().run(false).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isNotArray().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isNotArray().run(value).passes).toBe(true);
    });

    it('passes for functions', () => {
      const fn: any = () => {};
      expect(isNotArray().run(fn).passes).toBe(true);
    });
  });
});
