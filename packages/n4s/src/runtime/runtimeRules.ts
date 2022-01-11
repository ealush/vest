import type { DropFirst } from 'utilityTypes';

import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';

export type TArgs = any[];

export type TRuleValue = any;

export type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

type TBaseRules = typeof baseRules;
export type KBaseRules = keyof TBaseRules;

const baseRules = rules();

function getRule(ruleName: string): TRuleBase {
  return baseRules[ruleName as KBaseRules];
}

export { baseRules, getRule };

export type TRules<E = Record<string, unknown>> = n4s.EnforceCustomMatchers<
  TRules<E> & E
> &
  Record<string, (...args: TArgs) => TRules<E> & E> & {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<TBaseRules[P]>> | TArgs
    ) => TRules<E> & E;
  };

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare global {
  namespace n4s {
    interface IRules<E> extends TRules<E> {}
  }
}
