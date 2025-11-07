import { ctx } from 'enforceContext';

import { RuleRunReturn } from 'RuleRunReturn';
import { extendEager } from 'eager';
import { addToChain, registerLazyRule } from 'genRuleChain';

export function extendEnforce(
  enforce: any,
  rules: Record<string, (...args: any[]) => any>,
) {
  extendEager(rules);

  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName];
    const ruleWrapper = (value: any, ...args: any[]) => {
      const res = ctx.run({ value }, () => rule(value, ...args));
      return RuleRunReturn.create(res, value);
    };

    enforce[ruleName] = (...args: any[]) =>
      addToChain({}, (value: any) => ruleWrapper(value, ...args));

    registerLazyRule(
      ruleName,
      (...args: any[]) => (value: any) => ruleWrapper(value, ...args),
    );
  });
}
