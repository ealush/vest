import * as compounds from 'compounds';
import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';

export type TArgs = any[];

export type TRuleValue = any;

type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

const baseRules = rules();

function getRule(ruleName: string): TRuleBase {
  return (
    baseRules[ruleName as keyof typeof baseRules] ??
    compounds[ruleName as keyof typeof compounds] // eslint-disable-line import/namespace
  );
}

export { baseRules, compounds, getRule };
