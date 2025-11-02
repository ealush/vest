import { describe, it, expect } from 'vitest';

import { enforceLazy } from 'lazy';

describe('isValueOf', () => {
  describe('isValueOf', () => {
    it('pass when value exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(enforceLazy.isValueOf(obj).run(1).pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run(2).pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run(3).pass).toBe(true);
    });

    it('pass for falsy values', () => {
      const obj = { a: 0, b: false, c: null, d: undefined, e: '' };
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isValueOf(obj).run(0).pass).toBe(true);
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isValueOf(obj).run(false).pass).toBe(true);
      const nul: any = null;
      const undef: any = undefined;
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isValueOf(obj).run(nul).pass).toBe(true);
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isValueOf(obj).run(undef).pass).toBe(true);
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isValueOf(obj).run('').pass).toBe(true);
    });

    it('pass for string values', () => {
      const obj = { a: 'hello', b: 'world', c: 'test' };
      expect(enforceLazy.isValueOf(obj).run('hello').pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run('world').pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run('test').pass).toBe(true);
    });

    it('pass for object values', () => {
      const subObj1 = { x: 1 };
      const subObj2 = { y: 2 };
      const obj = { a: subObj1, b: subObj2 };
      expect(enforceLazy.isValueOf(obj).run(subObj1).pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run(subObj2).pass).toBe(true);
    });

    it('pass for array values', () => {
      const arr1 = [1, 2];
      const arr2 = [3, 4];
      const obj = { a: arr1, b: arr2 };
      expect(enforceLazy.isValueOf(obj).run(arr1).pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run(arr2).pass).toBe(true);
    });

    it('fails when value does not exist', () => {
      const obj = { a: 1, b: 2 };
      const val3: any = 3;
      const val5: any = 5;
      expect(enforceLazy.isValueOf(obj).run(val3).pass).toBe(false);
      expect(enforceLazy.isValueOf(obj).run(val5).pass).toBe(false);
    });

    it('fails for values in prototype chain', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      obj.own = 'ownValue';
      expect(enforceLazy.isValueOf(obj).run('ownValue').pass).toBe(true);
      const inherited: any = 'value';
      expect(enforceLazy.isValueOf(obj).run(inherited).pass).toBe(false);
    });

    it('works with empty objects', () => {
      const obj = {};
      const val: any = 1;
      expect(enforceLazy.isValueOf(obj).run(val).pass).toBe(false);
    });

    it('works with duplicate values', () => {
      const obj = { a: 1, b: 1, c: 2 };
      expect(enforceLazy.isValueOf(obj).run(1).pass).toBe(true);
      expect(enforceLazy.isValueOf(obj).run(2).pass).toBe(true);
    });

    it('uses strict equality for objects', () => {
      const obj = { a: { x: 1 }, b: { x: 1 } };
      const differentObj: any = { x: 1 };
      expect(enforceLazy.isValueOf(obj).run(differentObj).pass).toBe(false);
    });
  });

  describe('isNotValueOf', () => {
    it('pass when value does not exist in object', () => {
      const obj = { a: 1, b: 2 };
      const val3: any = 3;
      const val5: any = 5;
      const valStr: any = 'test';
      expect(enforceLazy.isNotValueOf(obj).run(val3).pass).toBe(true);
      expect(enforceLazy.isNotValueOf(obj).run(val5).pass).toBe(true);
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isNotValueOf(obj).run(valStr).pass).toBe(true);
    });

    it('pass for values in prototype chain', () => {
      const proto = { inherited: 'value' };
      const obj = Object.create(proto);
      obj.own = 'ownValue';
      const inherited: any = 'value';
      expect(enforceLazy.isNotValueOf(obj).run(inherited).pass).toBe(true);
    });

    it('fails when value exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(enforceLazy.isNotValueOf(obj).run(1).pass).toBe(false);
      expect(enforceLazy.isNotValueOf(obj).run(2).pass).toBe(false);
      expect(enforceLazy.isNotValueOf(obj).run(3).pass).toBe(false);
    });

    it('fails for falsy values that exist', () => {
      const obj = { a: 0, b: false, c: null };
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isNotValueOf(obj).run(0).pass).toBe(false);
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isNotValueOf(obj).run(false).pass).toBe(false);
      const nul: any = null;
      // @ts-expect-error - testing mixed-type object
      expect(enforceLazy.isNotValueOf(obj).run(nul).pass).toBe(false);
    });

    it('works with empty objects', () => {
      const obj = {};
      const val: any = 1;
      expect(enforceLazy.isNotValueOf(obj).run(val).pass).toBe(true);
    });

    it('uses strict equality for objects', () => {
      const targetObj = { x: 1 };
      const obj = { a: targetObj };
      const differentObj: any = { x: 1 };
      expect(enforceLazy.isNotValueOf(obj).run(differentObj).pass).toBe(true);
      expect(enforceLazy.isNotValueOf(obj).run(targetObj).pass).toBe(false);
    });
  });
});
