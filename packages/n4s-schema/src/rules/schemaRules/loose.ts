import { ctx } from 'enforceContext';

import { ShapeType } from './types';

import { BuildRule, Passing, RuleInstance } from 'enforceUtil';

export function loose<T extends Record<string, RuleInstance<any>>>(
  schema: T,
  _value?: ShapeType<T> & Record<string, unknown>,
): RuleInstance<
  ShapeType<T> & Record<string, unknown>,
  [ShapeType<T> & Record<string, unknown>]
> {
  return BuildRule<
    RuleInstance<
      ShapeType<T> & Record<string, unknown>,
      [ShapeType<T> & Record<string, unknown>]
    >,
    ShapeType<T> & Record<string, unknown>,
    [ShapeType<T> & Record<string, unknown>]
  >((v: ShapeType<T> & Record<string, unknown>) => {
    for (const key in schema) {
      const fieldValue = key in v ? v[key] : undefined;
      const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
        schema[key].run(fieldValue),
      );
      if (!res.pass) {
        return res;
      }
    }
    return Passing(v);
  });
}
