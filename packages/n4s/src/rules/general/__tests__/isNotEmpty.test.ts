import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('isNotEmpty', () => {
  describe('arrays', () => {
    it('fails for empty arrays', () => {
      expect(enforce.isNotEmpty().run([]).pass).toBe(false);
    });

    it('pass for non-empty arrays', () => {
      expect(enforce.isNotEmpty().run([1]).pass).toBe(true);
      expect(enforce.isNotEmpty().run([null]).pass).toBe(true);
      expect(enforce.isNotEmpty().run(['a']).pass).toBe(true);
    });
  });

  describe('strings', () => {
    it('fails for empty strings', () => {
      expect(enforce.isNotEmpty().run('').pass).toBe(false);
    });

    it('pass for non-empty strings', () => {
      expect(enforce.isNotEmpty().run('a').pass).toBe(true);
      expect(enforce.isNotEmpty().run(' ').pass).toBe(true);
      expect(enforce.isNotEmpty().run('hello').pass).toBe(true);
    });
  });

  describe('objects', () => {
    it('fails for empty objects', () => {
      expect(enforce.isNotEmpty().run({}).pass).toBe(false);
    });

    it('pass for objects with keys', () => {
      expect(enforce.isNotEmpty().run({ a: 1 }).pass).toBe(true);
      expect(enforce.isNotEmpty().run({ a: undefined }).pass).toBe(true);
      expect(enforce.isNotEmpty().run({ a: null }).pass).toBe(true);
    });
  });

  describe('numbers', () => {
    it('fails for zero', () => {
      expect(enforce.isNotEmpty().run(0).pass).toBe(false);
    });

    it('fails for NaN', () => {
      expect(enforce.isNotEmpty().run(NaN).pass).toBe(false);
    });

    it('pass for non-zero numbers', () => {
      expect(enforce.isNotEmpty().run(2).pass).toBe(true);
      expect(enforce.isNotEmpty().run(-1).pass).toBe(true);
      expect(enforce.isNotEmpty().run(Infinity).pass).toBe(true);
      expect(enforce.isNotEmpty().run(42).pass).toBe(true);
    });
  });

  describe('booleans', () => {
    it('fails for false', () => {
      expect(enforce.isNotEmpty().run(false).pass).toBe(false);
    });

    it('pass for true', () => {
      expect(enforce.isNotEmpty().run(true).pass).toBe(true);
    });
  });

  describe('nullish values', () => {
    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforce.isNotEmpty().run(value).pass).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforce.isNotEmpty().run(value).pass).toBe(false);
    });
  });
});
