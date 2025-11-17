import { RuleRunReturn } from '../../utils/RuleRunReturn';

export type Predicate = (value: any) => boolean | RuleRunReturn<any>;

function isRuleRunReturn(result: any): result is RuleRunReturn<any> {
  return typeof result === 'object' && result !== null && 'pass' in result;
}

export function executeChain(
  chain: Predicate[],
  value: any,
): RuleRunReturn<any> {
  for (const predicate of chain) {
    const result = predicate(value);

    if (isRuleRunReturn(result)) {
      if (!result.pass) return result as RuleRunReturn<any>;
    } else if (!result) {
      return RuleRunReturn.Failing(value);
    }
  }

  return RuleRunReturn.Passing(value);
}
