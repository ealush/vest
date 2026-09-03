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
  InternalRelationship,
  SchemaDependency,
  SchemaRelationship,
} from '../../schema/SchemaRelationship';
import type { RuleInstance, ScopeHandle } from '../../utils/RuleInstance';
import { cloneRelationship, groupDependencies } from '../../utils/RuleInstance';
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

// Boundary tracking for the standalone finalization boundary below. A plain
// call-depth counter is wrong here: a custom matcher can run an INDEPENDENT
// schema while another schema is active, and depth > 0 would wrongly skip
// the independent schema's own check. Instead this is a stack of the rule
// identities (chain targets) currently inside a boundary window.
//
// A nested entry skips its check only when it belongs to the active
// composition — the same rule re-entered, or a rule mounted into an active
// root's schema graph (reusable fragments whose dangling $.root edges stay
// lenient until finalization against the final root). An independent root is
// never a member of the active composition, so it always validates against
// its own root shape, nested or not.
const activeBoundaryRoots: object[] = [];

// Maps each chain proxy to its internal target so composition membership
// can be resolved by identity: `__schema` graphs hold proxies while the
// boundary receives targets.
const proxyToTarget = new WeakMap<object, object>();

function isObjectNode(node: unknown): node is Record<PropertyKey, unknown> {
  return !!node && typeof node === 'object';
}

function resolveBoundaryNode(node: unknown): object | null {
  if (!isObjectNode(node)) return null;
  return proxyToTarget.get(node) ?? node;
}

function schemaChildNodes(record: Record<PropertyKey, unknown>): unknown[] {
  const schema = record.__schema;
  if (!isObjectNode(schema)) return [];
  return Object.values(schema);
}

function itemChildNodes(record: Record<PropertyKey, unknown>): unknown[] {
  const item = record[Symbol.for('vest:itemSchema')];
  return isObjectNode(item) ? [item] : [];
}

function childNodesOf(resolved: object): unknown[] {
  const record = resolved as Record<PropertyKey, unknown>;
  return [...schemaChildNodes(record), ...itemChildNodes(record)];
}

function isCompositionMember(rule: unknown, roots: object[]): boolean {
  const seen = new Set<object>();
  const pending: unknown[] = [...roots];
  while (pending.length > 0) {
    const resolved = resolveBoundaryNode(pending.pop());
    if (resolved === rule) return true;
    if (!resolved || seen.has(resolved)) continue;
    seen.add(resolved);
    pending.push(...childNodesOf(resolved));
  }
  return false;
}

function withStandaloneRootedBoundary<R>(rule: unknown, fn: () => R): R {
  if (
    activeBoundaryRoots.length > 0 &&
    isCompositionMember(rule, activeBoundaryRoots)
  ) {
    return fn();
  }
  activeBoundaryRoots.push(rule as object);
  try {
    assertRuleRootedPathsValid(rule);
    return fn();
  } finally {
    activeBoundaryRoots.pop();
  }
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
    // Shared with RuleInstance.describe: identical output, one implementation.
    const resolved: SchemaRelationship[] = rawArray.map(cloneRelationship);
    const dependencies: SchemaDependency[] = groupDependencies(resolved);
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

  proxyToTarget.set(proxy as unknown as object, target as object);

  return { add, proxy } as const;
}
