import { ctx } from 'enforceContext';
import { invariant } from 'vest-utils';

import type { UnmodifiedRules, SchemaRules } from 'ruleRegistry';

import { enforceMessage, transformResult } from 'ruleResult';

type RuleCallConfig = {
  target: any;
  rule: UnmodifiedRules | SchemaRules;
  ruleName: string;
  value: any;
  customMessage: string | undefined;
  clearMessage: () => void;
};

export function createRuleCall(config: RuleCallConfig) {
  const { target, rule, ruleName, value, customMessage, clearMessage } = config;

  return function ruleCall(...args: any[]): any {
    const transformedResult = ctx.run({ value }, () =>
      transformResult(
        (rule as (...args: any[]) => any)(value, ...args),
        ruleName,
        value,
        ...args,
      ),
    );

    invariant(
      transformedResult.pass,
      enforceMessage(ruleName, transformedResult, value, customMessage),
    );

    clearMessage();
    target.pass = transformedResult.pass;

    return target;
  };
}
