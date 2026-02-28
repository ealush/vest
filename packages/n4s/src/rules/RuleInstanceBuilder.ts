import type { DropFirst } from 'vest-utils';

import type { RuleInstance } from '../utils/RuleInstance';

type InferRuleReturn<TValue, TFunc> = TFunc extends (...args: any[]) => {
  type: infer U;
}
  ? U
  : TValue;

/**
 * Generic type utility to build RuleInstance interfaces with chaining methods.
 * Eliminates repetitive interface definitions across rule type files.
 *
 * @template TValue - The value type being validated
 * @template TArgs - Tuple of arguments for the RuleInstance
 * @template TRules - Record of rule functions available for this type
 */
export type BuildRuleInstance<
  TValue,
  TArgs extends [any, ...any[]],
  TRules extends Record<string, (...args: any[]) => any>,
> = RuleInstance<TValue, TArgs> & {
  [K in keyof TRules]: (
    ...args: DropFirst<Parameters<TRules[K]>>
  ) => BuildRuleInstance<InferRuleReturn<TValue, TRules[K]>, TArgs, TRules>;
};

/**
 * Helper type to extract rule functions from a module exports object.
 * Filters out non-function exports and type-only exports.
 */
export type ExtractRuleFunctions<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};
