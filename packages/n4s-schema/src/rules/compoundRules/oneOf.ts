import { greaterThan } from 'vest-utils';

import { MultiTypeInput } from 'types';

import { BuildRule, RuleInstance, ruleRunReturn } from 'enforceUtil';

const REQUIRED_COUNT = 1;

export function oneOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]> {
  return BuildRule<
    RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]>,
    MultiTypeInput<T>,
    [MultiTypeInput<T>]
  >((value: MultiTypeInput<T>) => {
    let passingCount = 0;
    (rules as RuleInstance<any, any>[]).some(rule => {
      const res = rule.run(value as any);

      if (res.pass) {
        passingCount++;
      }

      if (greaterThan(passingCount, REQUIRED_COUNT)) {
        return false;
      }
    });

    return ruleRunReturn(passingCount === REQUIRED_COUNT, value);
  });
}
