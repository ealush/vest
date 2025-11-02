import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isNotEmpty', () => {
  describe('arrays', () => {
    it('fails for empty arrays', () => {
      expect(enforceLazy.isNotEmpty().run([]).pass).toBe(false);
    });

    it('pass for non-empty arrays', () => {
      expect(enforceLazy.isNotEmpty().run([1]).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run([null]).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run(['a']).pass).toBe(true);
    });
  });

  describe('strings', () => {
    it('fails for empty strings', () => {
      expect(enforceLazy.isNotEmpty().run('').pass).toBe(false);
    });

    it('pass for non-empty strings', () => {
      expect(enforceLazy.isNotEmpty().run('a').pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run(' ').pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run('hello').pass).toBe(true);
    });
  });

  describe('objects', () => {
    it('fails for empty objects', () => {
      expect(enforceLazy.isNotEmpty().run({}).pass).toBe(false);
    });

    it('pass for objects with keys', () => {
      expect(enforceLazy.isNotEmpty().run({ a: 1 }).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run({ a: undefined }).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run({ a: null }).pass).toBe(true);
    });
  });

  describe('numbers', () => {
    it('fails for zero', () => {
      expect(enforceLazy.isNotEmpty().run(0).pass).toBe(false);
    });

    it('fails for NaN', () => {
      expect(enforceLazy.isNotEmpty().run(NaN).pass).toBe(false);
    });

    it('pass for non-zero numbers', () => {
      expect(enforceLazy.isNotEmpty().run(2).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run(-1).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run(Infinity).pass).toBe(true);
      expect(enforceLazy.isNotEmpty().run(42).pass).toBe(true);
    });
  });

  describe('booleans', () => {
    it('fails for false', () => {
      expect(enforceLazy.isNotEmpty().run(false).pass).toBe(false);
    });

    it('pass for true', () => {
      expect(enforceLazy.isNotEmpty().run(true).pass).toBe(true);
    });
  });

  describe('nullish values', () => {
    it('fails for undefined', () => {
      const value: any = undefined;
      expect(enforceLazy.isNotEmpty().run(value).pass).toBe(false);
    });

    it('fails for null', () => {
      const value: any = null;
      expect(enforceLazy.isNotEmpty().run(value).pass).toBe(false);
    });
  });
});
