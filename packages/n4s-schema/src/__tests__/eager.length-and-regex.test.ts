import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('eager: length rules and regex/container', () => {
  describe('length-based rules (arrays and strings)', () => {
    it('lengthEquals / lengthNotEquals', () => {
      // lengthEquals
      enforce([1]).lengthEquals(1);
      enforce('a').lengthEquals(1);
      enforce([1, 2, 3]).lengthEquals(3);
      enforce('hello').lengthEquals(5);

      expect(() => enforce([1, 2]).lengthEquals(1)).toThrow();
      expect(() => enforce('').lengthEquals(1)).toThrow();

      // lengthNotEquals
      enforce([1]).lengthNotEquals(0);
      enforce('a').lengthNotEquals(3);
      enforce([]).lengthNotEquals(1);

      expect(() => enforce([1]).lengthNotEquals(1)).toThrow();
      expect(() => enforce('').lengthNotEquals(0)).toThrow();
    });

    it('longerThan / longerThanOrEquals', () => {
      // longerThan
      enforce([1]).longerThan(0);
      enforce('ab').longerThan(1);
      enforce([1, 2, 3]).longerThan(2);

      expect(() => enforce([1]).longerThan(2)).toThrow();
      expect(() => enforce('').longerThan(0)).toThrow();
      expect(() => enforce([1]).longerThan(1)).toThrow();

      // longerThanOrEquals
      enforce([1]).longerThanOrEquals(1);
      enforce('a').longerThanOrEquals(1);
      enforce([1]).longerThanOrEquals(0);
      enforce('ab').longerThanOrEquals(1);

      expect(() => enforce([1]).longerThanOrEquals(2)).toThrow();
      expect(() => enforce('').longerThanOrEquals(1)).toThrow();
    });

    it('shorterThan / shorterThanOrEquals', () => {
      // shorterThan
      enforce([]).shorterThan(1);
      enforce('a').shorterThan(2);
      enforce([1, 2]).shorterThan(3);

      expect(() => enforce([1]).shorterThan(0)).toThrow();
      expect(() => enforce('').shorterThan(0)).toThrow();
      expect(() => enforce([1]).shorterThan(1)).toThrow();

      // shorterThanOrEquals
      enforce([]).shorterThanOrEquals(1);
      enforce('a').shorterThanOrEquals(2);
      enforce([]).shorterThanOrEquals(0);
      enforce('a').shorterThanOrEquals(1);

      expect(() => enforce([1]).shorterThanOrEquals(0)).toThrow();
      expect(() => enforce('ab').shorterThanOrEquals(1)).toThrow();
    });

    it('minLength / maxLength', () => {
      // minLength (alias for longerThanOrEquals)
      enforce([1, 2]).minLength(2);
      enforce('hello').minLength(3);

      expect(() => enforce([1]).minLength(2)).toThrow();
      expect(() => enforce('hi').minLength(5)).toThrow();

      // maxLength (alias for shorterThanOrEquals)
      enforce([1, 2]).maxLength(3);
      enforce('hello').maxLength(5);

      expect(() => enforce([1, 2, 3]).maxLength(2)).toThrow();
      expect(() => enforce('hello').maxLength(3)).toThrow();
    });
  });

  describe('regex matching - matches / notMatches', () => {
    it('matches: accepts RegExp or string pattern', () => {
      // With RegExp objects
      enforce(1984).matches(/[0-9]/);
      enforce('1984').matches(/[0-9]/);
      enforce('198four').matches(/[0-9]/);

      // With string patterns
      enforce(1984).matches('[0-9]');
      enforce('1984').matches('[0-9]');
      enforce('198four').matches('[0-9]');

      // More complex patterns
      enforce('test@example.com').matches(/@/);
      enforce('hello123').matches(/[a-z]+[0-9]+/);

      expect(() => enforce('ninety eighty four').matches(/[0-9]/)).toThrow();
      expect(() => enforce('ninety eighty four').matches('[0-9]')).toThrow();
      expect(() => enforce('no digits here').matches(/\d/)).toThrow();
    });

    it('notMatches', () => {
      enforce('ninety eighty four').notMatches('[0-9]');
      enforce('hello').notMatches(/[0-9]/);
      enforce('abc').notMatches(/\d/);

      expect(() => enforce(1984).notMatches(/[0-9]/)).toThrow();
      expect(() => enforce('hello123').notMatches(/[0-9]/)).toThrow();
    });
  });

  describe('container membership - inside / notInside', () => {
    it('inside: string contains substring', () => {
      enforce('a').inside('cat');
      enforce('at').inside('cat');
      enforce('da').inside('tru dat.');

      expect(() => enforce('ad').inside('tru dat.')).toThrow();
      expect(() => enforce('x').inside('cat')).toThrow();
    });

    it('inside: array contains element', () => {
      enforce('x').inside(['x', 'y', 'z']);
      enforce(1).inside([1, 2, 3]);
      enforce(false).inside([true, false]);

      // Array of values checks if all are in container
      enforce(['x', 'y']).inside(['x', 'y', 'z']);

      expect(() => enforce('w').inside(['x', 'y', 'z'])).toThrow();
      expect(() => enforce(4).inside([1, 2, 3])).toThrow();
      expect(() => enforce('hello!').inside(['hello', 'world'])).toThrow();
    });

    it('notInside', () => {
      // String not in string
      enforce('ad').notInside('tru dat.');
      enforce('x').notInside('dog');

      // Element not in array
      enforce('w').notInside(['x', 'y', 'z']);
      enforce(3).notInside([1, 2]);
      enforce('hello!').notInside(['hello', 'world']);

      // Array with at least one item not in container
      enforce(['x', 'w']).notInside(['x', 'y', 'z']);

      expect(() => enforce('x').notInside(['x', 'y', 'z'])).toThrow();
      expect(() => enforce('da').notInside('tru dat.')).toThrow();
      expect(() => enforce('hello').notInside(['hello', 'world'])).toThrow();
    });
  });
});
