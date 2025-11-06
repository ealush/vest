import { hasOwnProperty } from 'vest-utils';

import { loose } from './loose';

import { Failing, Passing, RuleRunReturn } from 'enforceUtil';

export function shape<T extends Record<string, any>>(
  value: T,
  schema: Record<string, any>,
): RuleRunReturn<T> {
  const baseRes = loose(value, schema);
  if (!baseRes.pass) {
    return baseRes;
  }

  for (const key in value) {
    if (!hasOwnProperty(schema, key)) {
      return Failing(value);
    }
  }

  return Passing(value);
}
