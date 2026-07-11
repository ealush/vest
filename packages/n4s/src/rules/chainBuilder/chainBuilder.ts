/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import {
  dynamicValue,
  type DynamicValue,
  type Maybe,
  type Stringable,
} from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { RuleInstance } from '../../utils/RuleInstance';
import type { RuleRunReturn } from '../../utils/RuleRunReturn';
import type { IssueConfig, RuleDescriptor } from '../../issue';

import {
  executeChain,
  type ChainPredicate,
  type Predicate,
} from './chainExecutor';
import { createChainProxyHandlers } from './proxyHandlers';

export type RuleFunctions<T extends RuleInstance<any, any>> = Record<
  keyof Omit<T, 'infer' | 'test' | 'validate' | 'parse' | '~standard'>,
  (...args: any[]) => boolean | ReturnType<Predicate>
>;

type LazyMessage = DynamicValue<
  string,
  [value: unknown, originalMessage?: Stringable]
>;

/**
 * Creates a chain builder for rule validation.
 * Provides methods to add predicates, run validation, and apply custom messages.
 * Implements StandardSchema v1 support.
 */
export function createChainBuilder<T extends RuleInstance<any, any>>(
  rules: RuleFunctions<T> | Record<string, (...args: any[]) => any>,
) {
  const chain: ChainPredicate[] = [];
  const target: Partial<T> = {};
  let lazyMessage: Maybe<LazyMessage> = undefined;
  let lastAdded: ChainPredicate | undefined;

  const add = (p: Predicate, descriptor: RuleDescriptor): T => {
    lastAdded = { descriptor, predicate: p };
    chain.push(lastAdded);
    return proxy;
  };

  const prepend = (p: Predicate, descriptor: RuleDescriptor): T => {
    lastAdded = { descriptor, predicate: p };
    chain.unshift(lastAdded);
    return proxy;
  };

  const resolveMessage = (
    result: ReturnType<typeof executeChain>,
    value: unknown,
  ): string => {
    const defaultMessage = result.message || 'Validation failed';
    if (!lazyMessage) {
      return defaultMessage;
    }
    return dynamicValue(lazyMessage, value, result.message) ?? defaultMessage;
  };

  const validate: T['validate'] = ((...args: any[]) => {
    const result = executeChain(chain, args[0]);
    if (result.pass) {
      return { value: result.type };
    }
    return {
      issues: [toStandardIssue(result, resolveMessage(result, args[0]))],
    };
  }) as T['validate'];

  const test: T['test'] = ((...args: any[]) => {
    const result = validate(...args);
    return !result.issues;
  }) as T['test'];

  // Internal compatibility method - converts StandardSchema Result to RuleRunReturn

  const parse: T['parse'] = ((...args: any[]) => {
    const result = validate(...args);
    if (!result.issues) {
      return result.value;
    }

    const [firstIssue] = result.issues;
    throw new TypeError(firstIssue?.message || 'Validation failed');
  }) as T['parse'];

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

  const message = (msg: Stringable): T => {
    if (msg) {
      lazyMessage = msg;
    }
    return proxy;
  };

  const issue = (config: IssueConfig): T => {
    if (!lastAdded) {
      throw new TypeError('issue() must follow an enforce rule');
    }
    lastAdded.descriptor.issue = config;
    return proxy;
  };

  const proxy: T = new Proxy(
    target as T,
    createChainProxyHandlers(rules, {
      '~standard': {
        types: {
          input: undefined!,
          output: undefined!,
        },
        validate,
        vendor: 'n4s',
        version: 1 as const,
      } as StandardSchemaV1.Props<any, any>,
      add,
      issue,
      message,
      parse,
      prepend,
      run,
      test,
      validate,
    }),
  );

  return { add, proxy } as const;
}

function toStandardIssue(result: RuleRunReturn<any>, message: string) {
  return Object.assign(
    { message, path: result.path || [] },
    result.issue ? { code: result.issue.code, meta: result.issue.meta } : {},
  );
}
