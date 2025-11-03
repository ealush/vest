import { loose } from './loose';
import { ShapeType } from './types';

import { RuleInstance, Passing, Failing } from 'enforceUtil';

export function shape<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T>,
): RuleInstance<ShapeType<T>, [ShapeType<T>]> {
  return {
    run: (v: ShapeType<T>) => {
      // First check loose match (all schema fields exist and pass)
      const looseResult = loose(schema).run(v);
      if (!looseResult.pass) {
        return looseResult;
      }

      // Then verify no extra fields (exact match)
      for (const key in v) {
        if (!(key in schema)) {
          return Failing(v);
        }
      }

      return Passing(v);
    },
    infer: {} as ShapeType<T>,
  };
}
