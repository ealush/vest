/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import {
  dynamicValue,
  type DynamicValue,
  type Maybe,
  type Stringable,
} from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import type {
  RuleInstance,
  ScopeHandle,
} from '../../utils/RuleInstance';

import { executeChain, type Predicate } from './chainExecutor';
import { createChainProxyHandlers } from './proxyHandlers';

export type RuleFunctions<T extends RuleInstance<unknown, unknown[]>> = Record<
  keyof Omit<T, 'infer' | 'test' | 'validate' | 'parse' | '~standard' | 'dependsOn' | 'revalidates' | 'describe'>,
  (...args: unknown[]) => boolean | ReturnType<Predicate>
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
export function createChainBuilder<T extends RuleInstance<unknown, unknown[]>>(
  rules: RuleFunctions<T> | Record<string, (...args: unknown[]) => unknown>,
) {
  const chain: Predicate[] = [];
  const target: Partial<T> = {};
  let lazyMessage: Maybe<LazyMessage> = undefined;
  const unresolvedDeps: Array<{
    resolver: (scope: ScopeHandle) => unknown;
    isRevalidates: boolean;
  }> = [];

  const add = (p: Predicate): T => {
    chain.push(p);
    return proxy;
  };

  const prepend = (p: Predicate): T => {
    chain.unshift(p);
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

  const validate = ((...args: unknown[]) => {
    const result = executeChain(chain, args[0] as unknown);
    if (result.pass) {
      return { value: result.type } as ReturnType<T['validate']>;
    }
    return {
      issues: [
        {
          message: resolveMessage(result, args[0] as unknown),
          path: result.path || [],
        },
      ],
    } as ReturnType<T['validate']>;
  }) as unknown as T['validate'];

  const test = ((...args: unknown[]) => {
    const result = (validate as unknown as (...a: unknown[]) => ReturnType<T['validate']>)(...args);
    return !result.issues;
  }) as unknown as T['test'];

  // Internal compatibility method - converts StandardSchema Result to RuleRunReturn

  const parse = ((...args: unknown[]) => {
    const result = (validate as unknown as (...a: unknown[]) => ReturnType<T['validate']>)(...args);
    if (!result.issues) {
      return result.value as ReturnType<T['parse']>;
    }

    const [firstIssue] = result.issues as Array<{ message?: string }>;
    throw new TypeError(firstIssue?.message || 'Validation failed');
  }) as unknown as T['parse'];

  const run = ((...args: unknown[]) => {
    const result = executeChain(chain, args[0] as unknown);
    if (!result.pass && lazyMessage) {
      return {
        ...result,
        message:
          dynamicValue(lazyMessage, args[0] as unknown, result.message) ?? result.message,
      } as ReturnType<T['run']>;
    }
    return result as ReturnType<T['run']>;
  }) as unknown as T['run'];

  const message = (msg: Stringable): T => {
    if (msg) {
      lazyMessage = msg;
    }
    return proxy;
  };

  const dependsOn = (resolver: (scope: ScopeHandle) => unknown): T => {
    unresolvedDeps.push({ resolver, isRevalidates: false });
    // also store on target for external inspection (shape resolver)
    (target as unknown as Record<symbol, unknown>)[Symbol.for('vest:unresolvedDeps')] = unresolvedDeps;
    (proxy as unknown as Record<symbol, unknown>)[Symbol.for('vest:unresolvedDeps')] = unresolvedDeps;
    return proxy;
  };

  const revalidates = (resolver: (scope: ScopeHandle) => unknown): T => {
    unresolvedDeps.push({ resolver, isRevalidates: true });
    (target as unknown as Record<symbol, unknown>)[Symbol.for('vest:unresolvedDeps')] = unresolvedDeps;
    (proxy as unknown as Record<symbol, unknown>)[Symbol.for('vest:unresolvedDeps')] = unresolvedDeps;
    return proxy;
  };

  const describe = (): ReturnType<T['describe']> => {
    const raw =
      (target as unknown as Record<symbol, unknown>)[Symbol.for('vest:resolvedRelationships')] ||
      (proxy as unknown as Record<symbol, unknown>)[Symbol.for('vest:resolvedRelationships')] ||
      [];
    const rawArray = raw as Array<Record<string, unknown>>;
    // Clean internal flags
    const resolved = rawArray.map(rel => {
      const { __isRootSource, __isRootTarget, ...clean } = rel as Record<string, unknown> & {
        __isRootSource?: unknown;
        __isRootTarget?: unknown;
      };
      return clean;
    });
    // Group by target to produce dependencies
    const depMap = new Map<string, { target: unknown; sources: unknown[] }>();
    for (const rel of resolved) {
      const relRecord = rel as { target: unknown; source: unknown };
      const key = JSON.stringify(relRecord.target);
      if (!depMap.has(key)) {
        depMap.set(key, { target: relRecord.target, sources: [] });
      }
      depMap.get(key)!.sources.push(relRecord.source);
    }
    const dependencies = Array.from(depMap.values());
    return {
      dependencies,
      relationships: resolved,
    } as ReturnType<T['describe']>;
  };

  const proxy: T = new Proxy(
    target as T,
    createChainProxyHandlers(rules, {
      '~standard': {
        types: {
          input: undefined as unknown as T extends RuleInstance<infer I, unknown[]> ? I : unknown,
          output: undefined as unknown as T extends RuleInstance<infer O, unknown[]> ? O : unknown,
        },
        validate: validate as unknown as StandardSchemaV1.Props<unknown, unknown>['validate'],
        vendor: 'n4s',
        version: 1 as const,
      } as StandardSchemaV1.Props<unknown, unknown>,
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
    }),
  );

  // Ensure symbols are accessible via proxy get trap fallback
  (proxy as unknown as Record<symbol, unknown>)[Symbol.for('vest:unresolvedDeps')] = unresolvedDeps;

  return { add, proxy } as const;
}
