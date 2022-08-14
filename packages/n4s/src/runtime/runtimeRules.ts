import type { DropFirst } from 'vest-utils';

import type { RuleReturn } from 'ruleReturn';
import rules from 'rules';

export type Args = any[];

export type RuleValue = any;

export type RuleBase = (value: RuleValue, ...args: Args) => RuleReturn;

export type Rule = Record<string, RuleBase>;

type BaseRules = typeof baseRules;
export type KBaseRules = keyof BaseRules;

const baseRules = rules();

function getRule(ruleName: string): RuleBase {
  return baseRules[ruleName as KBaseRules];
}

export { baseRules, getRule };

type Rules<E = Record<string, unknown>> = n4s.EnforceCustomMatchers<
  Rules<E> & E
> &
  Record<string, (...args: Args) => Rules<E> & E> & {
    [P in KBaseRules]: (
      ...args: DropFirst<Parameters<BaseRules[P]>> | Args
    ) => Rules<E> & E;
  };

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare global {
  namespace n4s {
    interface IRules<E> extends Rules<E> {}
  }
}
