import { isObject } from 'vest-utils';

import { RuleRunReturn } from '../../utils/RuleRunReturn';

export type Predicate = (value: any) => boolean | RuleRunReturn<any>;

function isRuleRunReturn(result: any): result is RuleRunReturn<any> {
  return isObject(result) && 'pass' in result;
}

export function executeChain(
  chain: Predicate[],
  value: any,
): RuleRunReturn<any> {
  let currentValue = value;

  for (const predicate of chain) {
    const result = predicate(currentValue);

    if (isRuleRunReturn(result)) {
      if (!result.pass) return result as RuleRunReturn<any>;
      currentValue = result.type;
    } else if (!result) {
      return RuleRunReturn.Failing(currentValue);
    }
  }

  return RuleRunReturn.Passing(currentValue);
}
