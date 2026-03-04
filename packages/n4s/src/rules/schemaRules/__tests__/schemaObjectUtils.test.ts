import { describe, expect, it } from 'vitest';
import {
  checkDangerousKeys,
  findDangerousOwnKey,
  ownKeys,
} from '../schemaObjectUtils';

describe('schemaObjectUtils', () => {
  describe('ownKeys', () => {
    it('Should return only own enumerable properties', () => {
      const obj = { a: 1, b: 2 };
      Object.defineProperty(obj, 'c', { value: 3, enumerable: false });

      const proto = { inherited: true };
      Object.setPrototypeOf(obj, proto);

      const keys = ownKeys(obj);
      expect(keys).toEqual(['a', 'b']);
      expect(keys).not.toContain('c');
      expect(keys).not.toContain('inherited');
    });

    it('Should work with empty objects', () => {
      expect(ownKeys({})).toEqual([]);
    });

    it('Should return empty array for non-objects', () => {
      expect(ownKeys(null)).toEqual([]);
      expect(ownKeys(undefined)).toEqual([]);
      expect(ownKeys('string')).toEqual([]);
    });
  });

  describe('findDangerousOwnKey', () => {
    it('Should identify __proto__, constructor, and prototype as dangerous', () => {
      expect(findDangerousOwnKey(JSON.parse('{"__proto__": {}}'))).toBe(
        '__proto__',
      );
      expect(findDangerousOwnKey(JSON.parse('{"constructor": {}}'))).toBe(
        'constructor',
      );
      expect(findDangerousOwnKey(JSON.parse('{"prototype": {}}'))).toBe(
        'prototype',
      );
    });

    it('Should not flag regular keys as dangerous', () => {
      expect(findDangerousOwnKey({ name: 'john' })).toBeNull();
      expect(findDangerousOwnKey({ id: 1 })).toBeNull();
      expect(findDangerousOwnKey({ admin: true })).toBeNull();
    });
  });

  describe('checkDangerousKeys', () => {
    it('Should return false pass and path if the payload contains dangerous keys', () => {
      const payload = JSON.parse('{"__proto__": {"admin": true}}');
      const schema = { id: 1 };

      const result = checkDangerousKeys(payload, schema);
      expect(result).toEqual({ pass: false, path: ['__proto__'] });
    });

    it('Should return null if there are no dangerous keys', () => {
      const payload = { username: 'john' };
      const schema = { username: 1 };

      const result = checkDangerousKeys(payload, schema);
      expect(result).toBeNull();
    });

    it('Should return false pass and path if the schema contains dangerous keys', () => {
      const payload = { id: 1 };
      const schema = JSON.parse('{"constructor": 1}');

      const result = checkDangerousKeys(payload, schema);
      expect(result).toEqual({ pass: false, path: ['constructor'] });
    });

    it('Should handle non-object payloads gracefully (returns null)', () => {
      expect(checkDangerousKeys(null, {})).toBeNull();
      expect(checkDangerousKeys(undefined, {})).toBeNull();
      expect(checkDangerousKeys('string', {})).toBeNull();
    });
  });
});
