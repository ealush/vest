import { describe, it, expect } from 'vitest';

import { enforce } from 'n4s';

describe('object: isKeyOf / isNotKeyOf', () => {
  describe('isKeyOf', () => {
    it('pass when key exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      expect(enforce.isKeyOf(obj).run(keyA).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyB).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyC).pass).toBe(true);
    });

    it('pass when key exists with falsy value', () => {
      const obj = { a: 0, b: false, c: null, d: undefined };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      const keyD: any = 'd';
      expect(enforce.isKeyOf(obj).run(keyA).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyB).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyC).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyD).pass).toBe(true);
    });

    it('pass for numeric keys', () => {
      const obj = { 0: 'zero', 1: 'one', 42: 'answer' };
      const key0: any = 0;
      const key1: any = 1;
      const key42: any = 42;
      const keyStr0: any = '0';
      expect(enforce.isKeyOf(obj).run(key0).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(key1).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(key42).pass).toBe(true);
      expect(enforce.isKeyOf(obj).run(keyStr0).pass).toBe(true);
    });

    it('pass for symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      const key: any = sym;
      expect(enforce.isKeyOf(obj).run(key).pass).toBe(true);
    });

    it('fails when key does not exist', () => {
      const obj = { a: 1, b: 2 };
      const keyC: any = 'c';
      const keyX: any = 'x';
      expect(enforce.isKeyOf(obj).run(keyC).pass).toBe(false);
      expect(enforce.isKeyOf(obj).run(keyX).pass).toBe(false);
    });

    it('fails for keys in prototype chain', () => {
      const obj = Object.create({ inherited: 'value' });
      obj.own = 'value';
      const inherited: any = 'inherited';
      const own: any = 'own';
      expect(enforce.isKeyOf(obj).run(inherited).pass).toBe(false);
      expect(enforce.isKeyOf(obj).run(own).pass).toBe(true);
    });

    it('works with empty objects', () => {
      const obj = {};
      const key: any = 'a';
      expect(enforce.isKeyOf(obj).run(key).pass).toBe(false);
    });

    it('works with arrays', () => {
      const arr = ['a', 'b', 'c'];
      const key0: any = 0;
      const key2: any = 2;
      const key3: any = 3;
      expect(enforce.isKeyOf(arr).run(key0).pass).toBe(true);
      expect(enforce.isKeyOf(arr).run(key2).pass).toBe(true);
      expect(enforce.isKeyOf(arr).run(key3).pass).toBe(false);
    });
  });

  describe('isNotKeyOf', () => {
    it('pass when key does not exist in object', () => {
      const obj = { a: 1, b: 2 };
      const keyC: any = 'c';
      const keyX: any = 'x';
      const keyZ: any = 'z';
      expect(enforce.isNotKeyOf(obj).run(keyC).pass).toBe(true);
      expect(enforce.isNotKeyOf(obj).run(keyX).pass).toBe(true);
      expect(enforce.isNotKeyOf(obj).run(keyZ).pass).toBe(true);
    });

    it('pass for keys in prototype chain', () => {
      const obj = Object.create({ inherited: 'value' });
      obj.own = 'value';
      const inherited: any = 'inherited';
      expect(enforce.isNotKeyOf(obj).run(inherited).pass).toBe(true);
    });

    it('fails when key exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keyA: any = 'a';
      const keyB: any = 'b';
      expect(enforce.isNotKeyOf(obj).run(keyA).pass).toBe(false);
      expect(enforce.isNotKeyOf(obj).run(keyB).pass).toBe(false);
    });

    it('fails when key exists with falsy value', () => {
      const obj = { a: 0, b: false, c: null };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      expect(enforce.isNotKeyOf(obj).run(keyA).pass).toBe(false);
      expect(enforce.isNotKeyOf(obj).run(keyB).pass).toBe(false);
      expect(enforce.isNotKeyOf(obj).run(keyC).pass).toBe(false);
    });

    it('works with empty objects', () => {
      const obj = {};
      const key: any = 'a';
      expect(enforce.isNotKeyOf(obj).run(key).pass).toBe(true);
    });

    it('works with numeric keys', () => {
      const obj = { 0: 'zero', 1: 'one' };
      const key0: any = 0;
      const key2: any = 2;
      expect(enforce.isNotKeyOf(obj).run(key0).pass).toBe(false);
      expect(enforce.isNotKeyOf(obj).run(key2).pass).toBe(true);
    });
  });
});
