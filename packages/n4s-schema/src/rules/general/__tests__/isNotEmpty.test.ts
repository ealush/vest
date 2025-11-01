import { describe, it, expect } from 'vitest';

import { isNotEmpty } from '../isNotEmpty';

describe('isNotEmpty', () => {
  describe('arrays', () => {
    it('fails for empty arrays', () => {
      expect(isNotEmpty().run([]).passes).toBe(false);
    });

    it('passes for non-empty arrays', () => {
      expect(isNotEmpty().run([1]).passes).toBe(true);
      expect(isNotEmpty().run([null]).passes).toBe(true);
      expect(isNotEmpty().run(['a']).passes).toBe(true);
    });
  });

  describe('strings', () => {
    it('fails for empty strings', () => {
      expect(isNotEmpty().run('').passes).toBe(false);
    });

    it('passes for non-empty strings', () => {
      expect(isNotEmpty().run('a').passes).toBe(true);
      expect(isNotEmpty().run(' ').passes).toBe(true);
      expect(isNotEmpty().run('hello').passes).toBe(true);
    });
  });

  describe('objects', () => {
    it('fails for empty objects', () => {
      expect(isNotEmpty().run({}).passes).toBe(false);
    });

    it('passes for objects with keys', () => {
      expect(isNotEmpty().run({ a: 1 }).passes).toBe(true);
      expect(isNotEmpty().run({ a: undefined }).passes).toBe(true);
      expect(isNotEmpty().run({ a: null }).passes).toBe(true);
    });
  });

  describe('numbers', () => {
    it('fails for zero', () => {
      expect(isNotEmpty().run(0).passes).toBe(false);
    });

    it('fails for NaN', () => {
      expect(isNotEmpty().run(NaN).passes).toBe(false);
    });

    it('passes for non-zero numbers', () => {
      expect(isNotEmpty().run(2).passes).toBe(true);
      expect(isNotEmpty().run(-1).passes).toBe(true);
      expect(isNotEmpty().run(Infinity).passes).toBe(true);
      expect(isNotEmpty().run(42).passes).toBe(true);
    });
  });

  describe('booleans', () => {
    it('fails for false', () => {
      expect(isNotEmpty().run(false).passes).toBe(false);
    });

    it('passes for true', () => {
      expect(isNotEmpty().run(true).passes).toBe(true);
    });
  });

  describe('nullish values', () => {
    it('fails for undefined', () => {
      const value: any = undefined;
      expect(isNotEmpty().run(value).passes).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(isNotEmpty().run(value).passes).toBe(false);
    });
  });
});
