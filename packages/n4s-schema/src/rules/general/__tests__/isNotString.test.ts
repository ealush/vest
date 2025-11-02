import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotString', () => {
  it('fails for strings', () => {
    expect(enforceLazy.isNotString().run('a').pass).toBe(false);
    expect(enforceLazy.isNotString().run('').pass).toBe(false);
    expect(enforceLazy.isNotString().run('hello').pass).toBe(false);
    expect(enforceLazy.isNotString().run('123').pass).toBe(false);
  });

  describe('pass for non-string types', () => {
    it('pass for numbers', () => {
      const num: any = 1;
      const zero: any = 0;
      const nan: any = NaN;
      expect(enforceLazy.isNotString().run(num).pass).toBe(true);
      expect(enforceLazy.isNotString().run(zero).pass).toBe(true);
      expect(enforceLazy.isNotString().run(nan).pass).toBe(true);
    });

    it('pass for booleans', () => {
      const t: any = true;
      const f: any = false;
      expect(enforceLazy.isNotString().run(t).pass).toBe(true);
      expect(enforceLazy.isNotString().run(f).pass).toBe(true);
    });

    it('pass for objects', () => {
      const obj: any = {};
      const filled: any = { a: 1 };
      expect(enforceLazy.isNotString().run(obj).pass).toBe(true);
      expect(enforceLazy.isNotString().run(filled).pass).toBe(true);
    });

    it('pass for arrays', () => {
      const arr: any = [];
      const filled: any = [1, 2];
      expect(enforceLazy.isNotString().run(arr).pass).toBe(true);
      expect(enforceLazy.isNotString().run(filled).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotString().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotString().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => 'string';
      expect(enforceLazy.isNotString().run(fn).pass).toBe(true);
    });
  });
});
