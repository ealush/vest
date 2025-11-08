import { describe, it, expect } from 'vitest';

import { FALSY_VALUES, TRUTHY_VALUES } from './anyoneTestValues';

import run from 'runAnyoneMethods';

describe('lib/run', () => {
  describe('When value is falsy', () => {
    it.each([FALSY_VALUES])('Should return `false` ("%s")', value =>
      expect(run(value)).toBe(false),
    );
  });

  describe('When value is truthy', () => {
    it.each([TRUTHY_VALUES])('Should return `true` ("%s")', value =>
      expect(run(value)).toBe(true),
    );
  });

  describe('When value is a function', () => {
    describe('When value is falsy', () => {
      it.each([FALSY_VALUES])('Should return `false` ("%s")', value =>
        expect(run(() => value)).toBe(false),
      );
    });

    describe('When value is truthy', () => {
      it.each([TRUTHY_VALUES])('Should return `true` ("%s")', value =>
        expect(run(() => value)).toBe(true),
      );
    });
  });

  describe('When the function throws an error', () => {
    it('Should return false', () => {
      expect(
        run(() => {
          throw new Error();
        }),
      ).toBe(false);
    });
  });
});
