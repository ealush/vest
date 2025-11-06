import { hasOwnProperty } from 'vest-utils';

import { loose } from './loose';
import { ShapeType } from './types';

import { BuildRule, Failing, Passing, RuleInstance } from 'enforceUtil';

export function shape<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T>,
): RuleInstance<ShapeType<T>, [ShapeType<T>]> {
  return BuildRule<
    RuleInstance<ShapeType<T>, [ShapeType<T>]>,
    ShapeType<T>,
    [ShapeType<T>]
  >((v: ShapeType<T>) => {
    const baseRes = loose(schema).run(v);
    if (!baseRes.pass) {
      return baseRes;
    }

    for (const key in v) {
      if (!hasOwnProperty(schema, key)) {
        return Failing(v);
      }
    }

    return Passing(v);
  });
}
