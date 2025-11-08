import {
  dynamicValue,
  type DynamicValue,
  type Maybe,
  type Stringable,
} from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { executeChain, type Predicate } from 'chainExecutor';
import { createChainProxyHandlers } from 'proxyHandlers';

export type RuleFunctions<T extends RuleInstance<any, any>> = Record<
  keyof Omit<T, 'run' | 'infer' | 'test'>,
  (...args: any[]) => boolean
>;

type LazyMessage = DynamicValue<
  string,
  [value: unknown, originalMessage?: Stringable]
>;

/**
 * Creates a chain builder for rule validation.
 * Provides methods to add predicates, run validation, and apply custom messages.
 */
export function createChainBuilder<T extends RuleInstance<any, any>>(
  rules: RuleFunctions<T>,
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
