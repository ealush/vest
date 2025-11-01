import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotString', () => {
  it('fails for strings', () => {
    expect(enforceLazy.isNotString().run('a').passes).toBe(false);
    expect(enforceLazy.isNotString().run('').passes).toBe(false);
    expect(enforceLazy.isNotString().run('hello').passes).toBe(false);
    expect(enforceLazy.isNotString().run('123').passes).toBe(false);
  });

  describe('passes for non-string types', () => {
    it('passes for numbers', () => {
      const num: any = 1;
      const zero: any = 0;
      const nan: any = NaN;
      expect(enforceLazy.isNotString().run(num).passes).toBe(true);
      expect(enforceLazy.isNotString().run(zero).passes).toBe(true);
      expect(enforceLazy.isNotString().run(nan).passes).toBe(true);
    });

    it('passes for booleans', () => {
      const t: any = true;
      const f: any = false;
      expect(enforceLazy.isNotString().run(t).passes).toBe(true);
      expect(enforceLazy.isNotString().run(f).passes).toBe(true);
    });

    it('passes for objects', () => {
      const obj: any = {};
      const filled: any = { a: 1 };
      expect(enforceLazy.isNotString().run(obj).passes).toBe(true);
      expect(enforceLazy.isNotString().run(filled).passes).toBe(true);
    });

    it('passes for arrays', () => {
      const arr: any = [];
      const filled: any = [1, 2];
      expect(enforceLazy.isNotString().run(arr).passes).toBe(true);
      expect(enforceLazy.isNotString().run(filled).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotString().run(value).passes).toBe(true);
    });

    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotString().run(value).passes).toBe(true);
    });

    it('passes for functions', () => {
      const fn: any = () => 'string';
      expect(enforceLazy.isNotString().run(fn).passes).toBe(true);
    });
  });
});
