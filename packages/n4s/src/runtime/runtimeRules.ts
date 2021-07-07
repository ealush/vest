import * as compounds from 'compounds';
import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';

export type TArgs = any[];

export type TRuleValue = any;

type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

const baseRules = rules();

export { baseRules, compounds };
