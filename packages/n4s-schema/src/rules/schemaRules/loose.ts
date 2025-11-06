import { ctx } from 'enforceContext';

import { Passing, RuleRunReturn } from 'enforceUtil';

export function loose<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  for (const key in schema) {
    const fieldValue = key in value ? value[key] : undefined;
    const res = ctx.run({ value: fieldValue, set: true, meta: { key } }, () =>
      schema[key].run(fieldValue),
    );
    if (!res.pass) {
      return res as RuleRunReturn<T>;
    }
  }
  return Passing(value);
}
