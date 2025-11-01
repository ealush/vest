import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotEmpty', () => {
  describe('arrays', () => {
    it('fails for empty arrays', () => {
      expect(enforceLazy.isNotEmpty().run([]).passes).toBe(false);
    });

    it('passes for non-empty arrays', () => {
      expect(enforceLazy.isNotEmpty().run([1]).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run([null]).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run(['a']).passes).toBe(true);
    });
  });

  describe('strings', () => {
    it('fails for empty strings', () => {
      expect(enforceLazy.isNotEmpty().run('').passes).toBe(false);
    });

    it('passes for non-empty strings', () => {
      expect(enforceLazy.isNotEmpty().run('a').passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run(' ').passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run('hello').passes).toBe(true);
    });
  });

  describe('objects', () => {
    it('fails for empty objects', () => {
      expect(enforceLazy.isNotEmpty().run({}).passes).toBe(false);
    });

    it('passes for objects with keys', () => {
      expect(enforceLazy.isNotEmpty().run({ a: 1 }).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run({ a: undefined }).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run({ a: null }).passes).toBe(true);
    });
  });

  describe('numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNotEmpty().run(0).passes).toBe(false);
    });

    it('fails for NaN', () => {
      expect(enforceLazy.isNotEmpty().run(NaN).passes).toBe(false);
    });

    it('passes for non-zero numbers', () => {
      expect(enforceLazy.isNotEmpty().run(2).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run(-1).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run(Infinity).passes).toBe(true);
      expect(enforceLazy.isNotEmpty().run(42).passes).toBe(true);
    });
  });

  describe('booleans', () => {
    it('fails for false', () => {
      expect(enforceLazy.isNotEmpty().run(false).passes).toBe(false);
    });

    it('passes for true', () => {
      expect(enforceLazy.isNotEmpty().run(true).passes).toBe(true);
    });
  });

  describe('nullish values', () => {
    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotEmpty().run(value).passes).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotEmpty().run(value).passes).toBe(false);
    });
  });
});
