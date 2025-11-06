import { isNullish } from 'vest-utils';

import { BuildRule, Passing, RuleInstance } from 'enforceUtil';

export function optional<T>(
  rule: RuleInstance<T, any>,
): RuleInstance<T | undefined | null, [T | undefined | null]> {
  return BuildRule<
    RuleInstance<T | undefined | null, [T | undefined | null]>,
    T | undefined | null,
    [T | undefined | null]
  >((value: T | undefined | null) => {
    if (isNullish(value)) {
      return Passing(value);
    }
    return rule.run(value);
  });
}
