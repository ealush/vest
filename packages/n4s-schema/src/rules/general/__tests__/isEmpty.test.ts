import { describe, it, expect } from 'vitest';

import { isEmpty } from '../isEmpty';

describe('isEmpty', () => {
  describe('arrays', () => {
    it('passes for empty arrays', () => {
      expect(isEmpty().run([]).passes).toBe(true);
    });

    it('fails for non-empty arrays', () => {
      expect(isEmpty().run([1]).passes).toBe(false);
      expect(isEmpty().run([null]).passes).toBe(false);
    });
  });

  describe('strings', () => {
    it('passes for empty strings', () => {
      expect(isEmpty().run('').passes).toBe(true);
    });

    it('fails for non-empty strings', () => {
      expect(isEmpty().run('a').passes).toBe(false);
      expect(isEmpty().run(' ').passes).toBe(false);
    });
  });

  describe('objects', () => {
    it('passes for empty objects', () => {
      expect(isEmpty().run({}).passes).toBe(true);
    });

    it('fails for objects with keys', () => {
      expect(isEmpty().run({ a: 1 }).passes).toBe(false);
      expect(isEmpty().run({ a: undefined }).passes).toBe(false);
    });
  });

  describe('numbers', () => {
    it('passes for zero', () => {
      expect(isEmpty().run(0).passes).toBe(true);
    });

    it('passes for NaN', () => {
      expect(isEmpty().run(NaN).passes).toBe(true);
    });

    it('fails for non-zero numbers', () => {
      expect(isEmpty().run(2).passes).toBe(false);
      expect(isEmpty().run(-1).passes).toBe(false);
      expect(isEmpty().run(Infinity).passes).toBe(false);
    });
  });

  describe('booleans', () => {
    it('passes for false', () => {
      expect(isEmpty().run(false).passes).toBe(true);
    });

    it('fails for true', () => {
      expect(isEmpty().run(true).passes).toBe(false);
    });
  });

  describe('nullish values', () => {
    it('passes for undefined', () => {
      const value: any = undefined;
      expect(isEmpty().run(value).passes).toBe(true);
    });

    it('passes for null', () => {
      const value: any = null;
      expect(isEmpty().run(value).passes).toBe(true);
    });
  });
});
