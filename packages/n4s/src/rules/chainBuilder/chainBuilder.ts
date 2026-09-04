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
import {
  CHAIN_BASELINE,
  CHAIN_INFO,
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  assertRuleRootedPathsValid,
} from '../../schema/dependencyResolver';
import type { ChainBaseline, ChainInfo } from '../../schema/dependencyResolver';
import { isSchemaExecutionProjection } from '../../schema/projectionContext';

import { executeChain, type Predicate } from './chainExecutor';
import { createChainProxyHandlers } from './proxyHandlers';

const COMPOSITION_CHILDREN = Symbol.for('vest:compositionChildren');

export type RuleFunctions<T extends RuleInstance<unknown, unknown[]>> = Record<
  keyof Omit<
    T,
    | 'infer'
    | 'test'
    | 'validate'
    | 'parse'
    | '~standard'
    | 'dependsOn'
    | 'describe'
  >,
  (...args: unknown[]) => boolean | ReturnType<Predicate>
>;

type LazyMessage = DynamicValue<
  string,
  [value: unknown, originalMessage?: Stringable]
>;

type ObjectLike = object | ((...args: any[]) => unknown);
type BoundaryFrame = {
  members: WeakSet<object>;
};

// Only roots containing deferred $.root relationships need boundary tracking.
// Each active root computes its composition membership once; nested chain runs
// are then O(1) WeakSet lookups instead of repeatedly walking the schema graph.
const activeBoundaryFrames: BoundaryFrame[] = [];

// Maps each chain proxy to its internal target so composition membership
// resolves by identity: __schema graphs store proxies while run()/validate()
// receive their underlying targets.
const proxyToTarget = new WeakMap<object, object>();

function isObjectNode(node: unknown): node is ObjectLike {
  return (
    node !== null && (typeof node === 'object' || typeof node === 'function')
  );
}

function resolveBoundaryNode(node: unknown): object | null {
  if (!isObjectNode(node)) return null;
  return proxyToTarget.get(node as object) ?? (node as object);
}

function schemaChildNodes(record: Record<PropertyKey, unknown>): unknown[] {
  const schema = record.__schema;
  if (!schema || typeof schema !== 'object') return [];
  return Object.values(schema);
}

function itemChildNodes(record: Record<PropertyKey, unknown>): unknown[] {
  const item = record[ITEM_SCHEMA];
  if (Array.isArray(item)) return item.filter(isObjectNode);
  return isObjectNode(item) ? [item] : [];
}

function explicitCompositionChildren(
  record: Record<PropertyKey, unknown>,
): unknown[] {
  const children = record[COMPOSITION_CHILDREN];
  return Array.isArray(children) ? children.filter(isObjectNode) : [];
}

function childNodesOf(resolved: object): unknown[] {
  const record = resolved as Record<PropertyKey, unknown>;
  return [
    ...schemaChildNodes(record),
    ...itemChildNodes(record),
    ...explicitCompositionChildren(record),
  ];
}

function collectCompositionMembers(root: unknown): WeakSet<object> {
  const members = new WeakSet<object>();
  const seen = new Set<object>();
  const pending: unknown[] = [root];
  while (pending.length > 0) {
    const raw = pending.pop();
    if (isObjectNode(raw)) members.add(raw as object);
    const resolved = resolveBoundaryNode(raw);
    if (!resolved || seen.has(resolved)) continue;
    seen.add(resolved);
    members.add(resolved);
    pending.push(...childNodesOf(resolved));
  }
  return members;
}

function isActiveCompositionMember(rule: unknown): boolean {
  if (!isObjectNode(rule)) return false;
  const resolved = resolveBoundaryNode(rule);
  if (!resolved) return false;
  for (let i = activeBoundaryFrames.length - 1; i >= 0; i--) {
    const frame = activeBoundaryFrames[i];
    if (frame?.members.has(rule as object) || frame?.members.has(resolved)) {
      return true;
    }
  }
  return false;
}

function hasRootedRelationships(rule: unknown): boolean {
  if (!isObjectNode(rule)) return false;
  const rels = (rule as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS];
  return (
    Array.isArray(rels) &&
    (rels as InternalRelationship[]).some(
      rel => rel.__isRootSource === true || rel.__isRootTarget === true,
    )
  );
}

function withStandaloneRootedBoundary<R>(rule: unknown, fn: () => R): R {
  // Selective execution has already consumed relationship metadata to plan
  // the fragment. A planner-owned execution projection validates values only;
  // re-enforcing $.root provider membership here would turn metadata into an
  // execution dependency and force unrelated source validators to run.
  if (isSchemaExecutionProjection()) return fn();

  // The common case: ordinary rules and relationship graphs with only local
  // edges pay no boundary bookkeeping at all.
  if (!hasRootedRelationships(rule)) return fn();
  if (activeBoundaryFrames.length > 0 && isActiveCompositionMember(rule)) {
    return fn();
  }

  const frame = { members: collectCompositionMembers(rule) };
  activeBoundaryFrames.push(frame);
  try {
    assertRuleRootedPathsValid(rule);
    return fn();
  } finally {
    activeBoundaryFrames.pop();
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
  }> = [];

  const add = (p: Predicate): T => {
    chain.push(p);
    syncChainInfo();
    return proxy;
  };

  const prepend = (p: Predicate): T => {
    chain.unshift(p);
    syncChainInfo();
    return proxy;
  };

  const syncChainInfo = (): void => {
    const slots = target as unknown as Record<symbol, unknown>;
    const current = slots[CHAIN_INFO] as ChainInfo | undefined;
    const next: ChainInfo = {
      length: chain.length,
      hasMessage: current?.hasMessage ?? false,
    };
    slots[CHAIN_INFO] = next;
    (proxy as unknown as Record<symbol, unknown>)[CHAIN_INFO] = next;
  };

  const resolveMessage = (
    result: ReturnType<typeof executeChain>,
    value: unknown,
  ): string => {
    const defaultMessage = result.message || 'Validation failed';
    if (!lazyMessage) return defaultMessage;
    return dynamicValue(lazyMessage, value, result.message) ?? defaultMessage;
  };

  const validate = ((...args: unknown[]) => {
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

  const parse = ((...args: unknown[]) => {
    const result = (
      validate as unknown as (...a: unknown[]) => ReturnType<T['validate']>
    )(...args);
    if (!result.issues) return result.value as ReturnType<T['parse']>;
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
      const slots = target as unknown as Record<symbol, unknown>;
      const current = slots[CHAIN_INFO] as ChainInfo | undefined;
      const next: ChainInfo = {
        length: current?.length ?? chain.length,
        hasMessage: true,
      };
      slots[CHAIN_INFO] = next;
      (proxy as unknown as Record<symbol, unknown>)[CHAIN_INFO] = next;
    }
    return proxy;
  };

  const dependsOn = (resolver: (scope: ScopeHandle) => unknown): T => {
    unresolvedDeps.push({ resolver });
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
    const resolved: SchemaRelationship[] = rawArray.map(cloneRelationship);
    const dependencies: SchemaDependency[] = groupDependencies(resolved);
    return { dependencies, relationships: resolved } as ReturnType<
      T['describe']
    >;
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
      run,
      test,
      validate,
    }),
  );

  (proxy as unknown as Record<symbol, unknown>)[
    Symbol.for('vest:unresolvedDeps')
  ] = unresolvedDeps;
  proxyToTarget.set(proxy as unknown as object, target as object);

  return { add, proxy } as const;
}

/**
 * Freezes the chain baseline a rebuild must reproduce. Fresh-validation
 * combinators snapshot their own rule; delegating wrappers (optional)
 * snapshot the inner rule they validate through and capture it, so drift
 * checks recurse into post-wrap mutations of the wrapped rule.
 */
export function snapshotChainBaseline(target: unknown, source?: unknown): void {
  const frozen = freezeChainInfo(source ?? target);
  const baseline: ChainBaseline = isDelegatedWrap(source, target)
    ? { ...frozen, inner: source }
    : frozen;
  (target as unknown as Record<symbol, unknown>)[CHAIN_BASELINE] = baseline;
}

function freezeChainInfo(rule: unknown): {
  length: number;
  hasMessage: boolean;
} {
  const current = (rule as unknown as Record<symbol, unknown>)[CHAIN_INFO] as
    | ChainInfo
    | undefined;
  return {
    length: current?.length ?? 0,
    hasMessage: current?.hasMessage ?? false,
  };
}

function isDelegatedWrap(source: unknown, target: unknown): boolean {
  return source !== undefined && source !== target;
}
