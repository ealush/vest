import { executeChain, type Predicate } from './chainBuilder/chainExecutor';
import { registerLazyRule } from './chainBuilder/lazyRegistry';
import { createChainProxyHandlers } from './chainBuilder/proxyHandlers';

import { RuleInstance } from 'RuleInstance';

export { registerLazyRule };

function createChainBuilder<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
) {
  const chain: Predicate[] = [];
  const target: Partial<T> = {};

  const add = (p: Predicate): T => {
    chain.push(p);
    return proxy;
  };

  const run: T['run'] = ((...args: any[]) =>
    executeChain(chain, args[0])) as T['run'];

  const proxy: T = new Proxy(
    target as T,
    createChainProxyHandlers(rules, add, run),
  );

  return { add, proxy } as const;
}

export function addToChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
  predicate: Predicate,
): T {
  const { add, proxy } = createChainBuilder<T>(rules);
  add(predicate);
  return proxy as T;
}

export function genRuleChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
): (p: Predicate) => T {
  const { add } = createChainBuilder<T>(rules);
  return add;
}
