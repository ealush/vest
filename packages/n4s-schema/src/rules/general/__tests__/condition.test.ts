import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('condition', () => {
  describe('when condition is true', () => {
    it('pass with null input', () => {
      const value: any = null;
      expect(enforceLazy.condition(true).run(value).pass).toBe(true);
    });

    it('pass with undefined input', () => {
      const value: any = undefined;
      expect(enforceLazy.condition(true).run(value).pass).toBe(true);
    });

    it('pass with number input', () => {
      expect(enforceLazy.condition(true).run(42).pass).toBe(true);
      expect(enforceLazy.condition(true).run(0).pass).toBe(true);
    });

    it('pass with string input', () => {
      expect(enforceLazy.condition(true).run('test').pass).toBe(true);
      expect(enforceLazy.condition(true).run('').pass).toBe(true);
    });

    it('pass with boolean input', () => {
      expect(enforceLazy.condition(true).run(true).pass).toBe(true);
      expect(enforceLazy.condition(true).run(false).pass).toBe(true);
    });

    it('pass with object input', () => {
      expect(enforceLazy.condition(true).run({}).pass).toBe(true);
      expect(enforceLazy.condition(true).run({ a: 1 }).pass).toBe(true);
    });

    it('pass with array input', () => {
      expect(enforceLazy.condition(true).run([]).pass).toBe(true);
      expect(enforceLazy.condition(true).run([1, 2]).pass).toBe(true);
    });
  });

  describe('when condition is false', () => {
    it('fails with null input', () => {
      const value: any = null;
      expect(enforceLazy.condition(false).run(value).pass).toBe(false);
    });

    it('fails with undefined input', () => {
      const value: any = undefined;
      expect(enforceLazy.condition(false).run(value).pass).toBe(false);
    });

    it('fails with number input', () => {
      expect(enforceLazy.condition(false).run(42).pass).toBe(false);
      expect(enforceLazy.condition(false).run(0).pass).toBe(false);
    });

    it('fails with string input', () => {
      expect(enforceLazy.condition(false).run('test').pass).toBe(false);
      expect(enforceLazy.condition(false).run('').pass).toBe(false);
    });

    it('fails with boolean input', () => {
      expect(enforceLazy.condition(false).run(true).pass).toBe(false);
      expect(enforceLazy.condition(false).run(false).pass).toBe(false);
    });

    it('fails with object input', () => {
      expect(enforceLazy.condition(false).run({}).pass).toBe(false);
      expect(enforceLazy.condition(false).run({ a: 1 }).pass).toBe(false);
    });

    it('fails with array input', () => {
      expect(enforceLazy.condition(false).run([]).pass).toBe(false);
      expect(enforceLazy.condition(false).run([1, 2]).pass).toBe(false);
    });
  });
});
