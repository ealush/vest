import { RuleInstance } from '../utils/RuleInstance';

import {
  createChainBuilder,
  type RuleFunctions,
} from './chainBuilder/chainBuilder';
import { type Predicate } from './chainBuilder/chainExecutor';
import { registerLazyRule } from './chainBuilder/lazyRegistry';

export { registerLazyRule };

/**
 * Adds a predicate to a new rule chain and returns the chained rule instance.
 */
export function addToChain<T extends RuleInstance<any, any>>(
  rules: RuleFunctions<T>,
  predicate: Predicate,
): T {
  const { add, proxy } = createChainBuilder<T>(rules);
  add(predicate);
  return proxy as T;
}

/**
 * Generates a rule chain factory function.
 * Returns a function that accepts a predicate and returns a chained rule instance.
 */
export function genRuleChain<T extends RuleInstance<any, any>>(
  rules: RuleFunctions<T>,
): (p: Predicate) => T {
  const { add } = createChainBuilder<T>(rules);
  return add;
}
