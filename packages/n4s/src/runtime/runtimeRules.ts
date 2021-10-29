import assign from 'assign';
import type { DropFirst } from 'utilityTypes';

import compounds, { KCompounds, TCompounds } from 'compounds';
import type { TRuleReturn } from 'ruleReturn';
import rules from 'rules';
import schema from 'schema';

export type TArgs = any[];

export type TRuleValue = any;

export type TRuleBase = (value: TRuleValue, ...args: TArgs) => TRuleReturn;

export type TRule = Record<string, TRuleBase>;

type TBaseRules = typeof baseRules;
export type KBaseRules = keyof TBaseRules;

const baseRules = assign(rules(), compounds(), schema());

function getRule(ruleName: string): TRuleBase {
  return baseRules[ruleName as KBaseRules];
}

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */

declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {}
  }
}

export { baseRules, getRule };

export type TRules<E = Record<string, unknown>> = n4s.EnforceCustomMatchers<
  TRules & E
> &
  Record<string, (...args: TArgs) => TRules & E> &
  {
    [P in KCompounds]: (
      ...args: DropFirst<Parameters<TCompounds[P]>> | TArgs
    ) => TRules & E;
  } &
  {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<TBaseRules[P]>> | TArgs
    ) => TRules & E;
  };
