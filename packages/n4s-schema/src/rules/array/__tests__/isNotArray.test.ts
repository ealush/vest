import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotArray', () => {
  it('fails for arrays', () => {
    expect(enforceLazy.isNotArray().run([]).pass).toBe(false);
    expect(enforceLazy.isNotArray().run([1, 2, 3]).pass).toBe(false);
    expect(enforceLazy.isNotArray().run([null, undefined]).pass).toBe(false);
  });

  describe('pass for non-array types', () => {
    it('pass for objects', () => {
      expect(enforceLazy.isNotArray().run({}).pass).toBe(true);
      expect(enforceLazy.isNotArray().run({ a: 1 }).pass).toBe(true);
      expect(enforceLazy.isNotArray().run({ length: 3 }).pass).toBe(true);
    });

    it('pass for numbers', () => {
      expect(enforceLazy.isNotArray().run(0).pass).toBe(true);
      expect(enforceLazy.isNotArray().run(42).pass).toBe(true);
      expect(enforceLazy.isNotArray().run(-1).pass).toBe(true);
      expect(enforceLazy.isNotArray().run(NaN).pass).toBe(true);
    });

    it('pass for strings', () => {
      const str: any = 'text';
      const empty: any = '';
      expect(enforceLazy.isNotArray().run(str).pass).toBe(true);
      expect(enforceLazy.isNotArray().run(empty).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforceLazy.isNotArray().run(true).pass).toBe(true);
      expect(enforceLazy.isNotArray().run(false).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotArray().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotArray().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => {};
      expect(enforceLazy.isNotArray().run(fn).pass).toBe(true);
    });
  });
});
