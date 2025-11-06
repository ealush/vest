import { MultiTypeInput } from 'types';
import { mapFirst } from 'vest-utils';

import { BuildRule, Failing, RuleInstance } from 'enforceUtil';

export function anyOf<T extends RuleInstance<any, any>[]>(
  ...rules: T
): RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]> {
  return BuildRule<
    RuleInstance<MultiTypeInput<T>, [MultiTypeInput<T>]>,
    MultiTypeInput<T>,
    [MultiTypeInput<T>]
  >((value: MultiTypeInput<T>) => {
    return (
      mapFirst(rules as RuleInstance<any, any>[], (rule, breakout) => {
        const res = rule.run(value as any);
        breakout(res.pass, res);
      }) || Failing(value)
    );
  });
}
