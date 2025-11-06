import { isNullish } from 'vest-utils';

import { Passing, RuleRunReturn } from 'enforceUtil';

export function optional<T>(
  value: T | undefined | null,
  rule: any,
): RuleRunReturn<T | undefined | null> {
  if (isNullish(value)) {
    return Passing(value);
  }
  return rule.run(value);
}
