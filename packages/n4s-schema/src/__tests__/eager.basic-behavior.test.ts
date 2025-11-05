import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('eager: basic behavior and messages', () => {
  describe('basic behavior', () => {
    it('throws when a rule fails', () => {
      expect(() => enforce([]).isString()).toThrow();
      expect(() => enforce(1).greaterThan(1)).toThrow();
      expect(() => enforce(1).greaterThan(1).lessThan(0)).toThrow();
      expect(() => enforce('hi').matches(/[0-9]/)).toThrow();
    });

    it('returns silently when rule pass', () => {
      enforce(1).isNumber();
      enforce(1).greaterThan(0);
      enforce(1).greaterThan(0).lessThan(10);
      enforce('1984').matches(/[0-9]/);
    });

    it('includes a helpful failure message (rule name and value)', () => {
      expect(() => enforce('a').greaterThan('b')).toThrow(
        /enforce\/greaterThan failed with "a"/,
      );
      expect(() => enforce(['x']).shorterThan(0)).toThrow(
        /enforce\/shorterThan failed with \["x"\]/,
      );
    });
  });

  describe('custom messages with .message()', () => {
    it('throws custom message on rule failure', () => {
      expect(() =>
        enforce(1).message('Must be greater than 5').greaterThan(5),
      ).toThrow('Must be greater than 5');

      expect(() =>
        enforce('').message('Username is required').isNotEmpty(),
      ).toThrow('Username is required');
    });

    it('supports multiple .message() calls for different rules', () => {
      expect(() =>
        enforce('ab').message('Must be at least 3 characters').longerThan(2),
      ).toThrow('Must be at least 3 characters');

      // First rule pass, second fails with its message
      enforce('abc').message('Must be at least 3 characters').longerThan(2);

      expect(() =>
        enforce('abc')
          .message('Must be at least 3 characters')
          .longerThan(2)
          .message('Must be at most 5 characters')
          .shorterThan(3),
      ).toThrow('Must be at most 5 characters');
    });

    it('does not throw message when rule pass', () => {
      enforce(10).message('Should be greater').greaterThan(5);
      enforce('test').message('Should be string').isString();
    });
  });

  describe('equality', () => {
    it('equals / notEquals', () => {
      enforce(1).equals(1);
      enforce('hello').equals('hello');
      const a = [1, 2, 3];
      enforce(a).equals(a);

      expect(() => enforce('1').equals(1)).toThrow();
      expect(() => enforce([1, 2, 3]).equals([1, 2, 3])).toThrow();

      enforce('1').notEquals(1);
      enforce([1, 2, 3]).notEquals([1, 2, 3]);
      expect(() => enforce(a).notEquals(a)).toThrow();
      expect(() => enforce(1).notEquals(1)).toThrow();
    });
  });
});
