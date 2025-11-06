import { isNullish } from 'vest-utils';

import { BuildRule, Passing, RuleInstance } from 'enforceUtil';

// partial is a utility that wraps each schema field with optional
// It doesn't validate directly but transforms the schema
export function partial<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): Record<string, RuleInstance<any>> {
  const result: Record<string, RuleInstance<any>> = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      const originalRule = schema[key];
      result[key] = BuildRule((value: any) => {
        if (isNullish(value)) {
          return Passing(value);
        }
        return originalRule.run(value);
      });
    }
  }

  return result;
}
