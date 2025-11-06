import { isNullish } from 'vest-utils';

import { Passing, RuleInstance } from 'enforceUtil';

export function partial<T extends Record<string, RuleInstance<any>>>(
  schema: T,
): Record<string, RuleInstance<any>> {
  const result: Record<string, RuleInstance<any>> = {};

  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      const originalRule = schema[key];
      result[key] = {
        run: (value: any) => {
          if (isNullish(value)) {
            return Passing(value);
          }
          return originalRule.run(value);
        },
        infer: originalRule.infer,
      };
    }
  }

  return result;
}
