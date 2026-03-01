import { hasOwnProperty } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { RuleInstance } from '../../utils/RuleInstance';

import type { Predicate } from './chainExecutor';
import { getLazyRule } from './lazyRegistry';

export function createChainProxyHandlers<T extends RuleInstance<any, any>>(
  rules: Record<string, (...args: any[]) => any>,
  {
    add,
    test,
    validate,
    run,
    parse,
    message,
    prepend,
    '~standard': standard,
  }: {
    add: (p: Predicate) => T;
    test: T['test'];
    validate: T['validate'];
    run: T['run'];
    parse: T['parse'];
    message: (msg: any) => T;
    prepend: (p: Predicate) => T;
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

  return createProxyHandlersHelper(rules, methods, methodKeys, {
    add,
    prepend,
  });
}

function createProxyHandlersHelper<T extends RuleInstance<any, any>>(
  rules: Record<string, any>,
  methods: Record<string, any>,
  methodKeys: Set<string>,
  inserters: { add: (p: Predicate) => T; prepend: (p: Predicate) => T },
) {
  function getRuleHandler(prop: string | symbol) {
    if (hasOwnProperty(rules, prop)) {
      const insert = prop === 'defaultTo' ? inserters.prepend : inserters.add;
      return (...args: any[]) =>
        insert((value: any) => rules[prop](value, ...args));
    }

    if (typeof prop === 'string') {
      const lazyRule = getLazyRule(prop);
      if (lazyRule) {
        return (...args: any[]) => inserters.add(lazyRule(...args));
      }
    }

    return undefined;
  }

  return {
    get(_target: T, prop: string | symbol, receiver: any) {
      if (hasOwnProperty(methods, prop)) {
        return methods[prop];
      }

      return (
        getRuleHandler(prop) ?? Reflect.get(_target as object, prop, receiver)
      );
    },
    has(_target: T, prop: string | symbol) {
      if (typeof prop === 'string') {
        if (methodKeys.has(prop) || getLazyRule(prop)) return true;
      }
      if (hasOwnProperty(rules, prop)) return true;
      return Reflect.has(_target as object, prop);
    },
  };
}
