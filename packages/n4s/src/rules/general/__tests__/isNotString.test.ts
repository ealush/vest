import { describe, it, expect } from 'vitest';

import { enforce } from '../../../n4s';

describe('isNotString', () => {
  it('fails for strings', () => {
    expect(enforce.isNotString().run('a').pass).toBe(false);
    expect(enforce.isNotString().run('').pass).toBe(false);
    expect(enforce.isNotString().run('hello').pass).toBe(false);
    expect(enforce.isNotString().run('123').pass).toBe(false);
  });

  describe('pass for non-string types', () => {
    it('pass for numbers', () => {
      const num: any = 1;
      const zero: any = 0;
      const nan: any = NaN;
      expect(enforce.isNotString().run(num).pass).toBe(true);
      expect(enforce.isNotString().run(zero).pass).toBe(true);
      expect(enforce.isNotString().run(nan).pass).toBe(true);
    });

    it('pass for booleans', () => {
      const t: any = true;
      const f: any = false;
      expect(enforce.isNotString().run(t).pass).toBe(true);
      expect(enforce.isNotString().run(f).pass).toBe(true);
    });

    it('pass for objects', () => {
      const obj: any = {};
      const filled: any = { a: 1 };
      expect(enforce.isNotString().run(obj).pass).toBe(true);
      expect(enforce.isNotString().run(filled).pass).toBe(true);
    });

    it('pass for arrays', () => {
      const arr: any = [];
      const filled: any = [1, 2];
      expect(enforce.isNotString().run(arr).pass).toBe(true);
      expect(enforce.isNotString().run(filled).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isNotString().run(value).pass).toBe(true);
    });

    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotString().run(value).pass).toBe(true);
    });

    it('pass for functions', () => {
      const fn: any = () => 'string';
      expect(enforce.isNotString().run(fn).pass).toBe(true);
    });
  });
});
