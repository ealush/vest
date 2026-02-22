import { hasOwnProperty } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { RuleInstance } from '../../utils/RuleInstance';

import type { Predicate } from './chainExecutor';
import { getLazyRule } from './lazyRegistry';

export function createChainProxyHandlers<T extends RuleInstance<any, any>>(
  rules: Record<
    keyof Omit<T, 'infer' | 'test' | 'validate' | 'parse' | '~standard'>,
    (...args: any[]) => boolean
  >,
  {
    add,
    test,
    validate,
    run,
    parse,
    message,
    '~standard': standard,
  }: {
    add: (p: Predicate) => T;
    test: T['test'];
    validate: T['validate'];
    run: T['run'];
    parse: T['parse'];
    message: (msg: any) => T;
    '~standard': StandardSchemaV1.Props<any, any>;
  },
) {
  const methods = {
    '~standard': standard,
    message,
    parse,
    run,
    test,
    validate,
  };
  const methodKeys = new Set([
    'infer',
    'test',
    'validate',
    'run',
    'parse',
    'message',
    '~standard',
  ]);

  return createProxyHandlersHelper(rules, methods, methodKeys, add);
}

function createProxyHandlersHelper<T extends RuleInstance<any, any>>(
  rules: Record<string, any>,
  methods: Record<string, any>,
  methodKeys: Set<string>,
  add: (p: Predicate) => T,
) {
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
