import { hasOwnProperty } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';

import type { Predicate } from './chainExecutor';
import { getLazyRule } from './lazyRegistry';

export function createChainProxyHandlers<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'run' | 'infer' | 'test'>,
    (...args: any[]) => boolean
  >,
  {
    add,
    run,
    test,
    message,
  }: {
    add: (p: Predicate) => T;
    run: T['run'];
    test: T['test'];
    message: (msg: any) => T;
  },
) {
  const methods = { run, test, message };
  const methodKeys = new Set(['run', 'infer', 'test', 'message']);

  return {
    get(_target: T, prop: string | symbol, receiver: any) {
      if (hasOwnProperty(methods, prop as any)) {
        return methods[prop as keyof typeof methods];
      }

      if (hasOwnProperty(rules, prop as any)) {
        return (...args: any[]) =>
          add((value: any) => (rules as any)[prop](value, ...args));
      }

      const lazyRule = getLazyRule(prop as string);
      if (lazyRule) {
        return (...args: any[]) => add(lazyRule(...args));
      }

      return Reflect.get(_target as object, prop, receiver);
    },
    has(_target: T, prop: string | symbol) {
      if (methodKeys.has(prop as string)) return true;
      if (hasOwnProperty(rules, prop as any)) return true;
      if (getLazyRule(prop as string)) return true;
      return Reflect.has(_target as object, prop);
    },
  };
}
