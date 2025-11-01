import { describe, it, expect } from 'vitest';

import { checkKey } from '../checkKey';

describe('checkKey', () => {
  describe('isKeyOf', () => {
    it('passes when key exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      expect(checkKey().isKeyOf(obj).run(keyA).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyB).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyC).passes).toBe(true);
    });

    it('passes when key exists with falsy value', () => {
      const obj = { a: 0, b: false, c: null, d: undefined };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      const keyD: any = 'd';
      expect(checkKey().isKeyOf(obj).run(keyA).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyB).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyC).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyD).passes).toBe(true);
    });

    it('passes for numeric keys', () => {
      const obj = { 0: 'zero', 1: 'one', 42: 'answer' };
      const key0: any = 0;
      const key1: any = 1;
      const key42: any = 42;
      const keyStr0: any = '0';
      expect(checkKey().isKeyOf(obj).run(key0).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(key1).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(key42).passes).toBe(true);
      expect(checkKey().isKeyOf(obj).run(keyStr0).passes).toBe(true);
    });

    it('passes for symbol keys', () => {
      const sym = Symbol('test');
      const obj = { [sym]: 'value' };
      const key: any = sym;
      expect(checkKey().isKeyOf(obj).run(key).passes).toBe(true);
    });

    it('fails when key does not exist', () => {
      const obj = { a: 1, b: 2 };
      const keyC: any = 'c';
      const keyX: any = 'x';
      expect(checkKey().isKeyOf(obj).run(keyC).passes).toBe(false);
      expect(checkKey().isKeyOf(obj).run(keyX).passes).toBe(false);
    });

    it('fails for keys in prototype chain', () => {
      const obj = Object.create({ inherited: 'value' });
      obj.own = 'value';
      const inherited: any = 'inherited';
      const own: any = 'own';
      expect(checkKey().isKeyOf(obj).run(inherited).passes).toBe(false);
      expect(checkKey().isKeyOf(obj).run(own).passes).toBe(true);
    });

    it('works with empty objects', () => {
      const obj = {};
      const key: any = 'a';
      expect(checkKey().isKeyOf(obj).run(key).passes).toBe(false);
    });

    it('works with arrays', () => {
      const arr = ['a', 'b', 'c'];
      const key0: any = 0;
      const key2: any = 2;
      const key3: any = 3;
      expect(checkKey().isKeyOf(arr).run(key0).passes).toBe(true);
      expect(checkKey().isKeyOf(arr).run(key2).passes).toBe(true);
      expect(checkKey().isKeyOf(arr).run(key3).passes).toBe(false);
    });
  });

  describe('isNotKeyOf', () => {
    it('passes when key does not exist in object', () => {
      const obj = { a: 1, b: 2 };
      const keyC: any = 'c';
      const keyX: any = 'x';
      const keyZ: any = 'z';
      expect(checkKey().isNotKeyOf(obj).run(keyC).passes).toBe(true);
      expect(checkKey().isNotKeyOf(obj).run(keyX).passes).toBe(true);
      expect(checkKey().isNotKeyOf(obj).run(keyZ).passes).toBe(true);
    });

    it('passes for keys in prototype chain', () => {
      const obj = Object.create({ inherited: 'value' });
      obj.own = 'value';
      const inherited: any = 'inherited';
      expect(checkKey().isNotKeyOf(obj).run(inherited).passes).toBe(true);
    });

    it('fails when key exists in object', () => {
      const obj = { a: 1, b: 2, c: 3 };
      const keyA: any = 'a';
      const keyB: any = 'b';
      expect(checkKey().isNotKeyOf(obj).run(keyA).passes).toBe(false);
      expect(checkKey().isNotKeyOf(obj).run(keyB).passes).toBe(false);
    });

    it('fails when key exists with falsy value', () => {
      const obj = { a: 0, b: false, c: null };
      const keyA: any = 'a';
      const keyB: any = 'b';
      const keyC: any = 'c';
      expect(checkKey().isNotKeyOf(obj).run(keyA).passes).toBe(false);
      expect(checkKey().isNotKeyOf(obj).run(keyB).passes).toBe(false);
      expect(checkKey().isNotKeyOf(obj).run(keyC).passes).toBe(false);
    });

    it('works with empty objects', () => {
      const obj = {};
      const key: any = 'a';
      expect(checkKey().isNotKeyOf(obj).run(key).passes).toBe(true);
    });

    it('works with numeric keys', () => {
      const obj = { 0: 'zero', 1: 'one' };
      const key0: any = 0;
      const key2: any = 2;
      expect(checkKey().isNotKeyOf(obj).run(key0).passes).toBe(false);
      expect(checkKey().isNotKeyOf(obj).run(key2).passes).toBe(true);
    });
  });
});
