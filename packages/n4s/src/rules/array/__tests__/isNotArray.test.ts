import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNotArray', () => {
  it('fails for arrays', () => {
    expect(enforce.isNotArray().run([]).pass).toBe(false);
    expect(enforce.isNotArray().run([1, 2, 3]).pass).toBe(false);
    expect(enforce.isNotArray().run([null, undefined]).pass).toBe(false);
  });

  describe('pass for non-array types', () => {
    it('pass for objects', () => {
      expect(enforce.isNotArray().run({}).pass).toBe(true);
      expect(enforce.isNotArray().run({ a: 1 }).pass).toBe(true);
      expect(enforce.isNotArray().run({ length: 3 }).pass).toBe(true);
    });

    it('pass for numbers', () => {
      expect(enforce.isNotArray().run(0).pass).toBe(true);
      expect(enforce.isNotArray().run(42).pass).toBe(true);
      expect(enforce.isNotArray().run(-1).pass).toBe(true);
      expect(enforce.isNotArray().run(NaN).pass).toBe(true);
    });

    it('pass for strings', () => {
      const str: any = 'text';
      const empty: any = '';
      expect(enforce.isNotArray().run(str).pass).toBe(true);
      expect(enforce.isNotArray().run(empty).pass).toBe(true);
    });

    it('pass for booleans', () => {
      expect(enforce.isNotArray().run(true).pass).toBe(true);
      expect(enforce.isNotArray().run(false).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotArray().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotArray().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => {};
      expect(enforce.isNotArray().run(fn).pass).toBe(true);
    });
  });
});
