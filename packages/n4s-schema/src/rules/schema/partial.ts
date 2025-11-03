import { optional } from './optional';
import { InferShape } from './types';

import { RuleInstance } from 'enforceUtil';

export function partial<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): { [K in keyof T]: RuleInstance<InferShape<T[K]> | undefined | null> } {
  const result: { [key: string]: RuleInstance<any> } = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      result[key] = optional(schema[key]);
    }
  }

  return result as {
    [K in keyof T]: RuleInstance<InferShape<T[K]> | undefined | null>;
  };
}
