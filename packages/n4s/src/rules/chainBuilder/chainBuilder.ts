/* eslint-disable max-statements */
/* eslint-disable max-lines-per-function */
import {
  dynamicValue,
  type DynamicValue,
  type Maybe,
  type Stringable,
} from 'vest-utils';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import type { SchemaPath } from '../../schema/SchemaPath';
import type {
  InternalRelationship,
  SchemaDependency,
  SchemaRelationship,
} from '../../schema/SchemaRelationship';
import type { RuleInstance, ScopeHandle } from '../../utils/RuleInstance';
import { assertRuleRootedPathsValid } from '../../schema/dependencyResolver';

import { executeChain, type Predicate } from './chainExecutor';
import { createChainProxyHandlers } from './proxyHandlers';

export type RuleFunctions<T extends RuleInstance<unknown, unknown[]>> = Record<
  keyof Omit<
    T,
    | 'infer'
    | 'test'
    | 'validate'
    | 'parse'
    | '~standard'
    | 'dependsOn'
    | 'revalidates'
    | 'describe'
  >,
  (...args: unknown[]) => boolean | ReturnType<Predicate>
>;

type LazyMessage = DynamicValue<
  string,
  [value: unknown, originalMessage?: Stringable]
>;

// Reentrancy guard for the standalone finalization boundary below. Nested
// rule runs execute synchronously inside the outer chain (chainExecutor is
// fully synchronous), so exactly one boundary check runs per user-invoked
// test/run/parse/validate: the outermost one, against the final root. The
// depth window spans the whole chain execution, not just the check itself.
let boundaryDepth = 0;

function withStandaloneRootedBoundary<R>(rule: unknown, fn: () => R): R {
  if (boundaryDepth > 0) return fn();
  boundaryDepth++;
  try {
    assertRuleRootedPathsValid(rule);
    return fn();
  } finally {
    boundaryDepth--;
  }
}

// Copies a path segment-by-segment so public describe() output never shares
// array or segment references with the live relationship graph.
function clonePath(path: SchemaPath): SchemaPath {
  return path.map(seg => ({ ...seg }));
}

// Strips internal rootedness flags and deep-clones all paths/segments.
function cloneRelationship(rel: InternalRelationship): SchemaRelationship {
  return {
    ...(rel.metadata ? { metadata: { ...rel.metadata } } : {}),
    effect: rel.effect,
    source: clonePath(rel.source),
    target: clonePath(rel.target),
  };
}

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
    // Standalone finalization boundary: a schema carrying dangling $.root
    // edges is invalid here, even though composition stays lenient for
    // reusable fragments (validated again at their final root).
    return withStandaloneRootedBoundary(target, () => {
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
    });
  }) as unknown as T['validate'];

  const test = ((...args: unknown[]) => {
    const result = (
      validate as unknown as (...a: unknown[]) => ReturnType<T['validate']>
    )(...args);
    return !result.issues;
  }) as unknown as T['test'];

  // Internal compatibility method - converts StandardSchema Result to RuleRunReturn

  const parse = ((...args: unknown[]) => {
    const result = (
      validate as unknown as (...a: unknown[]) => ReturnType<T['validate']>
    )(...args);
    if (!result.issues) {
      return result.value as ReturnType<T['parse']>;
    }

    const [firstIssue] = result.issues as Array<{ message?: string }>;
    throw new TypeError(firstIssue?.message || 'Validation failed');
  }) as unknown as T['parse'];

  const run = ((...args: unknown[]) => {
    return withStandaloneRootedBoundary(target, () => {
      const result = executeChain(chain, args[0] as unknown);
      if (!result.pass && lazyMessage) {
        return {
          ...result,
          message:
            dynamicValue(lazyMessage, args[0] as unknown, result.message) ??
            result.message,
        } as ReturnType<T['run']>;
      }
      return result as ReturnType<T['run']>;
    });
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
    (target as unknown as Record<symbol, unknown>)[
      Symbol.for('vest:unresolvedDeps')
    ] = unresolvedDeps;
    (proxy as unknown as Record<symbol, unknown>)[
      Symbol.for('vest:unresolvedDeps')
    ] = unresolvedDeps;
    return proxy;
  };

  const revalidates = (resolver: (scope: ScopeHandle) => unknown): T => {
    unresolvedDeps.push({ resolver, isRevalidates: true });
    (target as unknown as Record<symbol, unknown>)[
      Symbol.for('vest:unresolvedDeps')
    ] = unresolvedDeps;
    (proxy as unknown as Record<symbol, unknown>)[
      Symbol.for('vest:unresolvedDeps')
    ] = unresolvedDeps;
    return proxy;
  };

  const describe = (): ReturnType<T['describe']> => {
    const raw =
      (target as unknown as Record<symbol, unknown>)[
        Symbol.for('vest:resolvedRelationships')
      ] ||
      (proxy as unknown as Record<symbol, unknown>)[
        Symbol.for('vest:resolvedRelationships')
      ] ||
      [];
    const rawArray = raw as InternalRelationship[];
    // Deep-clone paths/segments and drop internal flags so the public
    // snapshot shares no references with the live relationship graph.
    const resolved: SchemaRelationship[] = rawArray.map(cloneRelationship);
    // Group by target to produce dependencies. Clone again so dependencies
    // share no references with the relationships output either.
    const depMap = new Map<
      string,
      { target: SchemaPath; sources: SchemaPath[] }
    >();
    for (const rel of resolved) {
      const key = JSON.stringify(rel.target);
      let dep = depMap.get(key);
      if (!dep) {
        dep = { target: clonePath(rel.target), sources: [] };
        depMap.set(key, dep);
      }
      dep.sources.push(clonePath(rel.source));
    }
    const dependencies: SchemaDependency[] = Array.from(depMap.values());
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
          input: undefined as unknown as T extends RuleInstance<
            infer I,
            unknown[]
          >
            ? I
            : unknown,
          output: undefined as unknown as T extends RuleInstance<
            infer O,
            unknown[]
          >
            ? O
            : unknown,
        },
        validate: validate as unknown as StandardSchemaV1.Props<
          unknown,
          unknown
        >['validate'],
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
  (proxy as unknown as Record<symbol, unknown>)[
    Symbol.for('vest:unresolvedDeps')
  ] = unresolvedDeps;

  return { add, proxy } as const;
}
