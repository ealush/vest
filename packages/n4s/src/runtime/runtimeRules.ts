import compounds from 'compounds';
import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';
import schema from 'schema';

export type TArgs = any[];

export type TRuleValue = any;

export type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

export type TBaseRules = typeof baseRules;
export type KBaseRules = keyof TBaseRules;

const baseRules = Object.assign(rules(), compounds(), schema());

function getRule(ruleName: string): TRuleBase {
  return baseRules[ruleName as KBaseRules];
}

export { baseRules, getRule };
