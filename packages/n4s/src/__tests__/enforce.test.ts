import { describe, it, expect, beforeEach } from 'vitest';

import { enforce } from 'enforce';

import * as ruleReturn from 'ruleReturn';

describe(`enforce`, () => {
  describe('eager assertions', () => {
    it('Should throw an error when invalid', () => {
      expect(() => enforce('4').isNumber()).toThrow();
      expect(() => enforce('4').isNumber().isNotNumeric()).toThrow();
    });

    it('Should return silently when rule passes', () => {
      enforce(1).isNumber();
      enforce(1).greaterThan(0);
      enforce(1).greaterThan(0).lessThan(10);
    });

    describe('Custom Assertions', () => {
      beforeEach(() => {
        enforce.extend({
          startsWithUnderscore: (value: any) => ({
            pass: value.startsWith('_'),
            message: value + ' does not start with underscore',
          }),
        });
      });

      it('should return silently when rule passes', () => {
        enforce('_').startsWithUnderscore();
        enforce('_').startsWithUnderscore().isString();
      });

      it('should throw message string when rule fails', () => {
        expect(() => enforce(':(').startsWithUnderscore()).toThrow(
          ':( does not start with underscore',
        );
        expect(() =>
          enforce(':(').isString().startsWithUnderscore().isNumber(),
        ).toThrow(':( does not start with underscore');
      });
    });
  });

  describe('enforce..test for boolean return', () => {
    it('Should return true when valid', () => {
      expect(enforce.isNumber().test(1)).toBe(true);
      expect(enforce.isArray().test([])).toBe(true);
      expect(enforce.greaterThan(5).test(6)).toBe(true);
      expect(enforce.greaterThan(5).lessThan(7).test(6)).toBe(true);
    });

    it('Should return false when invalid', () => {
      expect(enforce.isNumber().test('1')).toBe(false);
      expect(enforce.isArray().test({})).toBe(false);
      expect(enforce.greaterThan(6).test(5)).toBe(false);
      expect(enforce.greaterThan(7).lessThan(5).test(6)).toBe(false);
    });
  });

  describe('enforce..run for structured return', () => {
    it('Should return pass:true when valid', () => {
      expect(enforce.isNumber().run(1)).toEqual(ruleReturn.passing());
      expect(enforce.isArray().run([])).toEqual(ruleReturn.passing());
      expect(enforce.greaterThan(5).run(6)).toEqual(ruleReturn.passing());
      expect(enforce.greaterThan(5).lessThan(7).run(6)).toEqual(
        ruleReturn.passing(),
      );
    });

    it('Should return pass:false when invalid', () => {
      expect(enforce.isNumber().run('1')).toEqual(ruleReturn.failing());
      expect(enforce.isArray().run({})).toEqual(ruleReturn.failing());
      expect(enforce.greaterThan(6).run(5)).toEqual(ruleReturn.failing());
      expect(enforce.greaterThan(7).lessThan(5).run(6)).toEqual(
        ruleReturn.failing(),
      );
    });
  });

  describe('enforce.extend for custom validators', () => {
    beforeEach(() => {
      enforce.extend({
        isEmail(value: string) {
          return {
            pass: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value),
            message: () => value + ' is not a valid email address',
          };
        },
      });
    });
    describe('enforce..test for boolean return', () => {
      it('Should return true when valid', () => {
        expect(enforce.isEmail().test('example@gmail.com')).toBe(true);
        expect(enforce.isEmail().isString().test('example@gmail.com')).toBe(
          true,
        );
      });

      it('Should return false when invalid', () => {
        expect(enforce.isEmail().test('example!gmail.com')).toBe(false);
        expect(enforce.isEmail().isString().test('example!gmail.com')).toBe(
          false,
        );
      });
    });

    describe('enforce..run for structured return', () => {
      it('Should return pass:true when valid', () => {
        expect(enforce.isEmail().run('example@gmail.com')).toEqual({
          pass: true,
        });

        expect(enforce.isEmail().isString().run('example@gmail.com')).toEqual({
          pass: true,
        });
      });

      it('Should return pass:false with message when invalid', () => {
        expect(enforce.isEmail().run('example!gmail.com')).toEqual({
          pass: false,
          message: 'example!gmail.com is not a valid email address',
        });

        expect(enforce.isEmail().isString().run('example!gmail.com')).toEqual({
          pass: false,
          message: 'example!gmail.com is not a valid email address',
        });
      });
    });

    describe('When accessing a rule that does not exist', () => {
      it('Should return undefined', () => {
        expect(enforce.doesNotExist).toBeUndefined();
      });
    });
  });

  describe('Test enforce().message', () => {
    it('Is enforce().message a function?', () => {
      expect(enforce('').message).toBeInstanceOf(Function);
    });
  });
});
