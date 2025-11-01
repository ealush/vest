import { describe, it, expect } from 'vitest';

import { enforceLazy } from '../../../lazy';

describe('condition', () => {
  describe('when condition is true', () => {
    it('passes with null input', () => {
      const value: any = null;
      expect(enforceLazy.condition(true).run(value).passes).toBe(true);
    });

    it('passes with undefined input', () => {
      const value: any = undefined;
      expect(enforceLazy.condition(true).run(value).passes).toBe(true);
    });

    it('passes with number input', () => {
      expect(enforceLazy.condition(true).run(42).passes).toBe(true);
      expect(enforceLazy.condition(true).run(0).passes).toBe(true);
    });

    it('passes with string input', () => {
      expect(enforceLazy.condition(true).run('test').passes).toBe(true);
      expect(enforceLazy.condition(true).run('').passes).toBe(true);
    });

    it('passes with boolean input', () => {
      expect(enforceLazy.condition(true).run(true).passes).toBe(true);
      expect(enforceLazy.condition(true).run(false).passes).toBe(true);
    });

    it('passes with object input', () => {
      expect(enforceLazy.condition(true).run({}).passes).toBe(true);
      expect(enforceLazy.condition(true).run({ a: 1 }).passes).toBe(true);
    });

    it('passes with array input', () => {
      expect(enforceLazy.condition(true).run([]).passes).toBe(true);
      expect(enforceLazy.condition(true).run([1, 2]).passes).toBe(true);
    });
  });

  describe('when condition is false', () => {
    it('fails with null input', () => {
      const value: any = null;
      expect(enforceLazy.condition(false).run(value).passes).toBe(false);
    });

    it('fails with undefined input', () => {
      const value: any = undefined;
      expect(enforceLazy.condition(false).run(value).passes).toBe(false);
    });

    it('fails with number input', () => {
      expect(enforceLazy.condition(false).run(42).passes).toBe(false);
      expect(enforceLazy.condition(false).run(0).passes).toBe(false);
    });

    it('fails with string input', () => {
      expect(enforceLazy.condition(false).run('test').passes).toBe(false);
      expect(enforceLazy.condition(false).run('').passes).toBe(false);
    });

    it('fails with boolean input', () => {
      expect(enforceLazy.condition(false).run(true).passes).toBe(false);
      expect(enforceLazy.condition(false).run(false).passes).toBe(false);
    });

    it('fails with object input', () => {
      expect(enforceLazy.condition(false).run({}).passes).toBe(false);
      expect(enforceLazy.condition(false).run({ a: 1 }).passes).toBe(false);
    });

    it('fails with array input', () => {
      expect(enforceLazy.condition(false).run([]).passes).toBe(false);
      expect(enforceLazy.condition(false).run([1, 2]).passes).toBe(false);
    });
  });
});
