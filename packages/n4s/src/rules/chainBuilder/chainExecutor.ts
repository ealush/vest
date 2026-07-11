import { isObject } from 'vest-utils';

import { RuleRunReturn } from '../../utils/RuleRunReturn';
import { deriveIssueMeta, type RuleDescriptor } from '../../issue';

export type Predicate = (value: any) => boolean | RuleRunReturn<any>;

export type ChainPredicate = {
  descriptor: RuleDescriptor;
  predicate: Predicate;
};

function isRuleRunReturn(result: any): result is RuleRunReturn<any> {
  return isObject(result) && 'pass' in result;
}

export function executeChain(
  chain: ChainPredicate[],
  value: any,
): RuleRunReturn<any> {
  let currentValue = value;

  for (const entry of chain) {
    const result = entry.predicate(currentValue);

    if (isRuleRunReturn(result)) {
      if (!result.pass) return withIssue(result, entry, currentValue);
      currentValue = result.type;
    } else if (!result) {
      return withIssue(
        RuleRunReturn.Failing(currentValue),
        entry,
        currentValue,
      );
    }
  }

  return RuleRunReturn.Passing(currentValue);
}

function withIssue(
  result: RuleRunReturn<any>,
  entry: ChainPredicate,
  value: unknown,
): RuleRunReturn<any> {
  if (!entry.descriptor.issue || result.issue) {
    return result;
  }

  result.message = entry.descriptor.issue.message;
  result.issue = {
    ...entry.descriptor.issue,
    meta: deriveIssueMeta(entry.descriptor, value),
  };
  return result;
}
