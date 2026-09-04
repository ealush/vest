import { hasOwnProperty } from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import {
  RuleInstance,
  type DescribeResult,
  type ScopeHandle,
} from '../../utils/RuleInstance';
import { CHAIN_PREPEND } from '../parsers/parserUtils';

import type { Predicate } from './chainExecutor';
import { getLazyRule } from './lazyRegistry';

export function createChainProxyHandlers<T extends RuleInstance<any, any>>(
  rules: Record<string, (...args: any[]) => any>,
  {
    add,
    dependsOn,
    describe,
    message,
    parse,
    prepend,
    revalidates,
    run,
    test,
    validate,
    '~standard': standard,
  }: {
    add: (p: Predicate) => T;
    dependsOn: (resolver: (scope: ScopeHandle) => unknown) => T;
    revalidates: () => T;
    describe: () => DescribeResult;
    message: (msg: any) => T;
    parse: T['parse'];
    prepend: (p: Predicate) => T;
    run: T['run'];
    test: T['test'];
    validate: T['validate'];
    '~standard': StandardSchemaV1.Props<any, any>;
  },
) {
  const methods = {
    '~standard': standard,
    dependsOn,
    describe,
    message,
    parse,
    revalidates,
    run,
    test,
    validate,
  };
  const methodKeys = new Set([
    'dependsOn',
    'describe',
    'infer',
    'message',
    'parse',
    'revalidates',
    'run',
    'test',
    'validate',
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
      const insert = rules[prop][CHAIN_PREPEND]
        ? inserters.prepend
        : inserters.add;
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
