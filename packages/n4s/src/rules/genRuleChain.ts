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
  rules: RuleFunctions<T> | Record<string, (...args: any[]) => any>,
  predicate: Predicate,
  mapsValue = false,
): T {
  const { add, proxy } = createChainBuilder<T>(rules);
  add(predicate, mapsValue);
  return proxy as T;
}
