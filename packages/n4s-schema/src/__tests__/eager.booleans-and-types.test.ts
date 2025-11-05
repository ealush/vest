import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s-schema';

describe('eager: booleans, truthiness, and type checks', () => {
  describe('booleans and truthiness', () => {
    it('isBoolean', () => {
      enforce(true).isBoolean();
      enforce(false).isBoolean();
      enforce(!!0).isBoolean();

      expect(() => enforce([]).isBoolean()).toThrow();
      expect(() => enforce('143').isBoolean()).toThrow();
      expect(() => enforce('false').isBoolean()).toThrow();
      expect(() => enforce(1).isBoolean()).toThrow();
    });

    it('isNotBoolean', () => {
      enforce('143').isNotBoolean();
      enforce(1).isNotBoolean();
      enforce([]).isNotBoolean();
      enforce({}).isNotBoolean();

      expect(() => enforce(true).isNotBoolean()).toThrow();
      expect(() => enforce(false).isNotBoolean()).toThrow();
    });

    it('equals for booleans', () => {
      enforce(true).equals(true);
      enforce(false).equals(false);

      expect(() => enforce(true).equals(false)).toThrow();
      expect(() => enforce(false).equals(true)).toThrow();
    });

    it('isTrue / isFalse', () => {
      // isTrue
      enforce(true).isTrue();

      expect(() => enforce(false).isTrue()).toThrow();
      expect(() => enforce(1).isTrue()).toThrow();
      expect(() => enforce('true').isTrue()).toThrow();

      // isFalse
      enforce(false).isFalse();

      expect(() => enforce(true).isFalse()).toThrow();
      expect(() => enforce(0).isFalse()).toThrow();
      expect(() => enforce('').isFalse()).toThrow();
    });

    it('isTruthy / isFalsy', () => {
      // isTruthy
      enforce('hi').isTruthy();
      enforce(true).isTruthy();
      enforce(1).isTruthy();
      enforce([]).isTruthy();
      enforce({}).isTruthy();

      expect(() => enforce(false).isTruthy()).toThrow();
      expect(() => enforce(null).isTruthy()).toThrow();
      expect(() => enforce(undefined).isTruthy()).toThrow();
      expect(() => enforce(0).isTruthy()).toThrow();
      expect(() => enforce(NaN).isTruthy()).toThrow();
      expect(() => enforce('').isTruthy()).toThrow();

      // isFalsy
      enforce('').isFalsy();
      enforce(false).isFalsy();
      enforce(0).isFalsy();
      enforce(undefined).isFalsy();
      enforce(null).isFalsy();
      enforce(NaN).isFalsy();

      expect(() => enforce(1).isFalsy()).toThrow();
      expect(() => enforce(true).isFalsy()).toThrow();
      expect(() => enforce('hi').isFalsy()).toThrow();
      expect(() => enforce([]).isFalsy()).toThrow();
    });
  });

  describe('type checks', () => {
    it('isArray / isNotArray', () => {
      // isArray
      enforce([]).isArray();
      enforce([1, 2, 3]).isArray();
      enforce(['hello']).isArray();

      expect(() => enforce({}).isArray()).toThrow();
      expect(() => enforce('hello').isArray()).toThrow();
      expect(() => enforce(123).isArray()).toThrow();

      // isNotArray
      enforce('no').isNotArray();
      enforce({}).isNotArray();
      enforce(123).isNotArray();
      enforce('hello').isNotArray();

      expect(() => enforce([]).isNotArray()).toThrow();
      expect(() => enforce([1, 2]).isNotArray()).toThrow();
    });

    it('isString / isNotString', () => {
      // isString
      enforce('a').isString();
      enforce('hello').isString();
      enforce('').isString();

      expect(() => enforce(1).isString()).toThrow();
      expect(() => enforce([]).isString()).toThrow();
      expect(() => enforce({}).isString()).toThrow();

      // isNotString
      enforce(1).isNotString();
      enforce([]).isNotString();
      enforce({}).isNotString();
      enforce(true).isNotString();

      expect(() => enforce('a').isNotString()).toThrow();
      expect(() => enforce('').isNotString()).toThrow();
    });

    it('isNumber / isNotNumber', () => {
      // isNumber
      enforce(1).isNumber();
      enforce(0).isNumber();
      enforce(-5).isNumber();
      enforce(3.14).isNumber();

      expect(() => enforce('1').isNumber()).toThrow();
      expect(() => enforce(NaN).isNumber()).toThrow();
      expect(() => enforce([]).isNumber()).toThrow();

      // isNotNumber
      enforce('1').isNotNumber();
      enforce([]).isNotNumber();
      enforce({}).isNotNumber();
      enforce(NaN).isNotNumber();

      expect(() => enforce(1).isNotNumber()).toThrow();
      expect(() => enforce(0).isNotNumber()).toThrow();
    });

    it('isNaN / isNotNaN', () => {
      // isNaN
      enforce(NaN).isNaN();
      enforce(Number('not a number')).isNaN();

      expect(() => enforce(1).isNaN()).toThrow();
      expect(() => enforce(0).isNaN()).toThrow();
      expect(() => enforce('NaN').isNaN()).toThrow();

      // isNotNaN
      enforce(1).isNotNaN();
      enforce(0).isNotNaN();
      enforce('123').isNotNaN();

      expect(() => enforce(NaN).isNotNaN()).toThrow();
    });

    it('nullish checks - isNull / isNotNull', () => {
      // isNull
      enforce(null).isNull();

      expect(() => enforce(undefined).isNull()).toThrow();
      expect(() => enforce('x').isNull()).toThrow();
      expect(() => enforce(0).isNull()).toThrow();
      expect(() => enforce(false).isNull()).toThrow();

      // isNotNull
      enforce('x').isNotNull();
      enforce(undefined).isNotNull();
      enforce(0).isNotNull();
      enforce(false).isNotNull();
      enforce([]).isNotNull();

      expect(() => enforce(null).isNotNull()).toThrow();
    });

    it('isUndefined / isNotUndefined', () => {
      // isUndefined
      enforce(undefined).isUndefined();
      let x;
      enforce(x).isUndefined();

      expect(() => enforce(null).isUndefined()).toThrow();
      expect(() => enforce('x').isUndefined()).toThrow();
      expect(() => enforce(0).isUndefined()).toThrow();

      // isNotUndefined
      enforce('x').isNotUndefined();
      enforce(null).isNotUndefined();
      enforce(0).isNotUndefined();
      enforce(false).isNotUndefined();

      expect(() => enforce(undefined).isNotUndefined()).toThrow();
    });

    it('isNullish / isNotNullish', () => {
      // isNullish
      enforce(null).isNullish();
      enforce(undefined).isNullish();

      expect(() => enforce('x').isNullish()).toThrow();
      expect(() => enforce(0).isNullish()).toThrow();
      expect(() => enforce(false).isNullish()).toThrow();
      expect(() => enforce('').isNullish()).toThrow();

      // isNotNullish
      enforce('x').isNotNullish();
      enforce(0).isNotNullish();
      enforce(false).isNotNullish();
      enforce('').isNotNullish();
      enforce([]).isNotNullish();

      expect(() => enforce(null).isNotNullish()).toThrow();
      expect(() => enforce(undefined).isNotNullish()).toThrow();
    });
  });
});
