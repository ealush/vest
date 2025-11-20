import { hasOwnProperty } from 'vest-utils';

import { RuleInstance } from '../../utils/RuleInstance';

import type { Predicate } from './chainExecutor';
import { getLazyRule } from './lazyRegistry';

export function createChainProxyHandlers<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'run' | 'infer' | 'test'>,
    (...args: any[]) => boolean
  >,
  add: (p: Predicate) => T,
  run: T['run'],
  test: T['test'],
  message: (msg: any) => T,
) {
  return {
    get(_target: T, prop: string | symbol, receiver: any) {
      if (prop === 'run') return run;
      if (prop === 'test') return test;
      if (prop === 'message') return message;

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
      if (
        prop === 'run' ||
        prop === 'infer' ||
        prop === 'test' ||
        prop === 'message'
      )
        return true;
      if (hasOwnProperty(rules, prop as any)) return true;
      if (getLazyRule(prop as string)) return true;
      return Reflect.has(_target as object, prop);
    },
  };
}
