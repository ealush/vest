import { describe, it, expect } from 'vitest';
import {
  isIsolateType,
  isSameIsolateType,
  isSameIsolateIdentity,
} from '../IsolateSelectors';
import { IsolateKeys } from '../IsolateKeys';

describe('IsolateSelectors', () => {
  const type = 'TEST_TYPE';
  const otherType = 'OTHER_TYPE';

  const isolate1 = { [IsolateKeys.Type]: type, key: 'key1' };
  const isolate2 = { [IsolateKeys.Type]: type, key: 'key1' };
  const isolate3 = { [IsolateKeys.Type]: type, key: 'key2' };
  const isolate4 = { [IsolateKeys.Type]: otherType, key: 'key1' };
  const nullIsolate = null;
  const undefinedIsolate = undefined;

  describe('isIsolateType', () => {
    it('should return true if type matches', () => {
      // @ts-ignore
      expect(isIsolateType(isolate1, type)).toBe(true);
    });

    it('should return false if type matches', () => {
      // @ts-ignore
      expect(isIsolateType(isolate1, otherType)).toBe(false);
    });

    it('should return false if node is null/undefined', () => {
      // @ts-ignore
      expect(isIsolateType(nullIsolate, type)).toBe(false);
      // @ts-ignore
      expect(isIsolateType(undefinedIsolate, type)).toBe(false);
    });
  });

  describe('isSameIsolateType', () => {
    it('should return true if type matches', () => {
      // @ts-ignore
      expect(isSameIsolateType(isolate1, isolate2)).toBe(true);
    });

    it('should return false if type matches', () => {
      // @ts-ignore
      expect(isSameIsolateType(isolate1, isolate4)).toBe(false);
    });
  });

  describe('isSameIsolateIdentity', () => {
    it('should return true if strictly equal', () => {
      // @ts-ignore
      expect(isSameIsolateIdentity(isolate1, isolate1)).toBe(true);
    });

    it('should return true if type and key match', () => {
      // @ts-ignore
      expect(isSameIsolateIdentity(isolate1, isolate2)).toBe(true);
    });

    it('should return false if keys differ', () => {
      // @ts-ignore
      expect(isSameIsolateIdentity(isolate1, isolate3)).toBe(false);
    });

    it('should return false if types differ', () => {
      // @ts-ignore
      expect(isSameIsolateIdentity(isolate1, isolate4)).toBe(false);
    });
  });
});
