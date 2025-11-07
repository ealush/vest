import { isNullish } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

export function optional<T>(
  value: T | undefined | null,
  rule: any,
): RuleRunReturn<T | undefined | null> {
  if (isNullish(value)) {
    return RuleRunReturn.Passing(value);
  }
  return rule.run(value);
}

// Type for optional rule instance
export type OptionalRuleInstance<T> = RuleInstance<
  T | undefined | null,
  [T | undefined | null]
>;

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace n4s {
    interface ValueFirstRules {
      optional: <T>(
        value: T | undefined | null,
        rule: RuleInstance<T, any>,
      ) => RuleRunReturn<T | undefined | null>;
    }
  }
}
