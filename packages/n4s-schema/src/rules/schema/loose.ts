import { ShapeType } from './types';

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function loose<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T> & Record<string, unknown>,
): RuleInstance<
  ShapeType<T> & Record<string, unknown>,
  [ShapeType<T> & Record<string, unknown>]
> {
  return {
    run: (v: ShapeType<T> & Record<string, unknown>) => {
      // Check that each schema field pass its rule
      for (const key in schema) {
        const value = key in v ? v[key] : undefined;
        if (!schema[key].run(value).pass) {
          return Failing(v);
        }
      }
      return Passing(v);
    },
    infer: {} as ShapeType<T>,
  };
}
