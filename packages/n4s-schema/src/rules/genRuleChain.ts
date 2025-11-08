import {
  dynamicValue,
  type Stringable,
  type Maybe,
  type DynamicValue,
} from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { executeChain, type Predicate } from 'chainExecutor';
import { registerLazyRule } from 'lazyRegistry';
import { createChainProxyHandlers } from 'proxyHandlers';

export { registerLazyRule };

type LazyMessage = DynamicValue<
  string,
  [value: unknown, originalMessage?: Stringable]
>;

function createChainBuilder<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'run' | 'infer' | 'test'>,
    (...args: any[]) => boolean
  >,
) {
  const chain: Predicate[] = [];
  const target: Partial<T> = {};
  let lazyMessage: Maybe<LazyMessage> = undefined;

  const add = (p: Predicate): T => {
    chain.push(p);
    return proxy;
  };

  const run: T['run'] = ((...args: any[]) => {
    const result = executeChain(chain, args[0]);
    // Apply custom message if validation failed
    if (!result.pass && lazyMessage) {
      return {
        ...result,
        message:
          dynamicValue(lazyMessage, args[0], result.message) ?? result.message,
      };
    }
    return result;
  }) as T['run'];

  const test: T['test'] = ((...args: any[]) =>
    executeChain(chain, args[0]).pass) as T['test'];

  const message = (msg: Stringable): T => {
    if (msg) {
      lazyMessage = msg;
    }
    return proxy;
  };

  const proxy: T = new Proxy(
    target as T,
    createChainProxyHandlers(rules, add, run, test, message),
  );

  return { add, proxy } as const;
}

export function addToChain<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'run' | 'infer' | 'test'>,
    (...args: any[]) => boolean
  >,
  predicate: Predicate,
): T {
  const { add, proxy } = createChainBuilder<T>(rules);
  add(predicate);
  return proxy as T;
}

export function genRuleChain<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'run' | 'infer' | 'test'>,
    (...args: any[]) => boolean
  >,
): (p: Predicate) => T {
  const { add } = createChainBuilder<T>(rules);
  return add;
}
