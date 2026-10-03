import { describe, expect, it } from 'vitest';

import { IReconciler, VestRuntime } from '../../vestjs-runtime';
import { Isolate } from '../Isolate';
import {
  useGetFromRegistry,
  useHasFromRegistry,
  useUpdateRegistry,
} from '../IsolateRegistry';

describe('IsolateRegistry key lookup', () => {
  it.each([
    { key: '', expected: [''] },
    { key: 'name', expected: ['name'] },
    { key: undefined, expected: ['', 'name'] },
    { key: 'missing', expected: [] },
  ])('should return $expected for key $key', ({ key, expected }) => {
    const stateRef = VestRuntime.createRef({} as IReconciler, value => value);

    VestRuntime.Run(stateRef, () => {
      Isolate.create('root', () => {
        for (const fieldName of ['', 'name']) {
          const isolate = Isolate.create('test', () => {}, { fieldName });
          useUpdateRegistry(isolate, {
            tests: {
              predicate: () => true,
              getKey: node => node.data.fieldName,
            },
          });
        }

        expect(
          Array.from(
            useGetFromRegistry('tests', key),
            node => node.data.fieldName,
          ),
        ).toEqual(expected);
        expect(useHasFromRegistry('tests', key)).toBe(expected.length > 0);
        expect(useGetFromRegistry('tests').size).toBe(2);
      });
    });
  });

  it('should not find a named isolate when the empty key has no entries', () => {
    const stateRef = VestRuntime.createRef({} as IReconciler, value => value);

    VestRuntime.Run(stateRef, () => {
      Isolate.create('root', () => {
        const isolate = Isolate.create('test', () => {}, { fieldName: 'name' });
        useUpdateRegistry(isolate, {
          tests: {
            predicate: () => true,
            getKey: node => node.data.fieldName,
          },
        });

        expect(useGetFromRegistry('tests', '')).toEqual(new Set());
        expect(useHasFromRegistry('tests', '')).toBe(false);
        expect(useHasFromRegistry('tests')).toBe(true);
      });
    });
  });
});
