import * as compounds from 'compounds';
import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';

export type TArgs = any[];

export type TRuleValue = any;

type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

const baseRules = rules();

function getRule(ruleName: string) {
  // @ts-ignore - this should actually be fine
  return baseRules[ruleName] || compounds[ruleName];
}

export { baseRules, compounds, getRule };
