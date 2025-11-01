import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isEmpty', () => {
  describe('arrays', () => {
    it('passes for empty arrays', () => {
      expect(enforceLazy.isEmpty().run([]).passes).toBe(true);
    });

    it('fails for non-empty arrays', () => {
      expect(enforceLazy.isEmpty().run([1]).passes).toBe(false);
      expect(enforceLazy.isEmpty().run([null]).passes).toBe(false);
    });
  });

  describe('strings', () => {
    it('passes for empty strings', () => {
      expect(enforceLazy.isEmpty().run('').passes).toBe(true);
    });

    it('fails for non-empty strings', () => {
      expect(enforceLazy.isEmpty().run('a').passes).toBe(false);
      expect(enforceLazy.isEmpty().run(' ').passes).toBe(false);
    });
  });

  describe('objects', () => {
    it('passes for empty objects', () => {
      expect(enforceLazy.isEmpty().run({}).passes).toBe(true);
    });

    it('fails for objects with keys', () => {
      expect(enforceLazy.isEmpty().run({ a: 1 }).passes).toBe(false);
      expect(enforceLazy.isEmpty().run({ a: undefined }).passes).toBe(false);
    });
  });

  describe('numbers', () => {
    it('passes for zero', () => {
      expect(enforceLazy.isEmpty().run(0).passes).toBe(true);
    });

    it('passes for NaN', () => {
      expect(enforceLazy.isEmpty().run(NaN).passes).toBe(true);
    });

    it('fails for non-zero numbers', () => {
      expect(enforceLazy.isEmpty().run(2).passes).toBe(false);
      expect(enforceLazy.isEmpty().run(-1).passes).toBe(false);
      expect(enforceLazy.isEmpty().run(Infinity).passes).toBe(false);
    });
  });

  describe('booleans', () => {
    it('passes for false', () => {
      expect(enforceLazy.isEmpty().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(enforceLazy.isEmpty().run(true).passes).toBe(false);
    });
  });

  describe('nullish values', () => {
    it('passes for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isEmpty().run(value).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(enforceLazy.isEmpty().run(value).passes).toBe(true);
    });
  });
});
