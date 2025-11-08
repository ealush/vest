import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isEmpty', () => {
  describe('arrays', () => {
    it('pass for empty arrays', () => {
      expect(enforce.isEmpty().run([]).pass).toBe(true);
    });

    it('fails for non-empty arrays', () => {
      expect(enforce.isEmpty().run([1]).pass).toBe(false);
      expect(enforce.isEmpty().run([null]).pass).toBe(false);
    });
  });

  describe('strings', () => {
    it('pass for empty strings', () => {
      expect(enforce.isEmpty().run('').pass).toBe(true);
    });

    it('fails for non-empty strings', () => {
      expect(enforce.isEmpty().run('a').pass).toBe(false);
      expect(enforce.isEmpty().run(' ').pass).toBe(false);
    });
  });

  describe('objects', () => {
    it('pass for empty objects', () => {
      expect(enforce.isEmpty().run({}).pass).toBe(true);
    });

    it('fails for objects with keys', () => {
      expect(enforce.isEmpty().run({ a: 1 }).pass).toBe(false);
      expect(enforce.isEmpty().run({ a: undefined }).pass).toBe(false);
    });
  });

  describe('numbers', () => {
    it('pass for zero', () => {
      expect(enforce.isEmpty().run(0).pass).toBe(true);
    });

    it('pass for NaN', () => {
      expect(enforce.isEmpty().run(NaN).pass).toBe(true);
    });

    it('fails for non-zero numbers', () => {
      expect(enforce.isEmpty().run(2).pass).toBe(false);
      expect(enforce.isEmpty().run(-1).pass).toBe(false);
      expect(enforce.isEmpty().run(Infinity).pass).toBe(false);
    });
  });

  describe('booleans', () => {
    it('pass for false', () => {
      expect(enforce.isEmpty().run(false).pass).toBe(true);
    });

    it('fails for true', () => {
      expect(enforce.isEmpty().run(true).pass).toBe(false);
    });
  });

  describe('nullish values', () => {
    it('pass for undefined', () => {
      const value: any = undefined;
      expect(enforce.isEmpty().run(value).pass).toBe(true);
    });

    it('pass for null', () => {
      const value: any = null;
      expect(enforce.isEmpty().run(value).pass).toBe(true);
    });
  });
});
