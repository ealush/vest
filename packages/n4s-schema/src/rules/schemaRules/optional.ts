import { isNullish } from 'vest-utils';

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
