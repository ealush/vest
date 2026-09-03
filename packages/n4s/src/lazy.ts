/* eslint-disable complexity, max-lines-per-function, max-statements, sort-keys -- schema relationship rebasing */
import { FirstParam } from './eager/typeUtils';
import { adaptDynamicRules } from './lazy/ruleAdapter';
import { typeRules } from './lazy/typeRules';
import type { CustomMatcherArgs } from './n4sTypes';
import type { ArrayRuleInstance } from './rules/arrayRules';
import * as arrayRules from './rules/arrayRules';
import * as compoundRules from './rules/compoundRules/compoundRules';
import type { CompoundRuleLazyTypes } from './rules/compoundRules/compoundRules';
import { addToChain } from './rules/genRuleChain';
import { AnyRuleInstance } from './rules/generalRules';
import * as generalRules from './rules/generalRules';
import type { ObjectRulesUnion } from './rules/objectRules';
import * as objectRules from './rules/objectRules';
import * as schemaRules from './rules/schemaRules/schemaRules';
import { lazy as lazyRule } from './rules/schemaRules/lazy';
import type { SchemaRuleLazyTypes } from './rules/schemaRules/schemaRules';
import { type RuleInstance } from './utils/RuleInstance';
import { asArray, isObject } from 'vest-utils';
import { ctx } from './enforceContext';
import { RuleRunReturn } from './utils/RuleRunReturn';
import {
  ITEM_CONTAINER,
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
  resolveInlineDeps,
} from './schema/dependencyResolver';
import type { ItemContainerKind } from './schema/dependencyResolver';
import { rebaseRelationships } from './schema/rebase';
import type { SchemaPath } from './schema/SchemaPath';
import type { InternalRelationship } from './schema/SchemaRelationship';

/**
 * Extracts the output type from a custom matcher function.
 * If the matcher returns { type: T }, uses T (coercion rules like toNumber).
 * Otherwise falls back to the first parameter type (validation rules like isPositive).
 */
type InferMatcherOutput<K extends keyof n4s.EnforceMatchers> =
  ReturnType<Extract<n4s.EnforceMatchers[K], (...args: any[]) => any>> extends {
    type: infer T;
  }
    ? T
    : FirstParam<n4s.EnforceMatchers[K]>;

type TCustomLazyRules = {
  [K in keyof n4s.EnforceMatchers as K extends keyof SchemaRuleLazyTypes
    ? never
    : K extends keyof CompoundRuleLazyTypes
      ? never
      : K]: (
    ...args: CustomMatcherArgs<K>
  ) => RuleInstance<
    InferMatcherOutput<K>,
    [FirstParam<n4s.EnforceMatchers[K]>]
  >;
};

function collectSchemaRelationships(
  schema: Record<string, any>,
  keyFilter?: (key: string) => boolean,
): InternalRelationship[] {
  const relationships: InternalRelationship[] = resolveInlineDeps(
    schema as Record<string, RuleInstance<unknown, unknown[]>>,
    [],
    schema as Record<string, unknown>,
  ) as unknown as InternalRelationship[];
  for (const key of Object.keys(schema)) {
    if (keyFilter && !keyFilter(key)) continue;
    const fieldRule: any = (schema as Record<string, any>)[key];
    const nested =
      (fieldRule?.[RESOLVED_RELATIONSHIPS] as
        | InternalRelationship[]
        | undefined) || [];
    if (nested.length > 0) {
      const prefix = [{ type: 'property', key } as const];
      relationships.push(...rebaseRelationships(nested, prefix));
    }
    relationships.push(
      ...collectItemRelationships(
        fieldRule?.[ITEM_SCHEMA],
        [{ type: 'property', key } as const],
        `${String(key)}.$item`,
        new WeakSet(),
      ),
    );
  }
  return relationships;
}

/**
 * Collects item-graph edges through arbitrarily nested containers. Each
 * level appends an `item` segment to the accumulated prefix, so an edge
 * inside `isArrayOf(isArrayOf(inner))` surfaces under
 * `m.$item.$item.*` instead of vanishing. The seen-set guards only the
 * current descent path (cycle safety): the same member rule object may
 * legitimately recur under a different prefix — e.g. a diamond
 * `isArrayOf(mid, inner)` where `mid = isArrayOf(inner)` emits both the
 * direct `m.$item.*` edge and the nested `m.$item.$item.*` edge — and a
 * shared set would swallow the second occurrence. It is per top-level
 * field for the same reason: one member mounted under several fields
 * rebases under each key independently.
 */
function collectItemRelationships(
  item: unknown,
  prefix: SchemaPath,
  binding: string,
  seen: WeakSet<object>,
): InternalRelationship[] {
  const relationships: InternalRelationship[] = [];
  // Dedupe identical edges at every level: converging diamonds (the same
  // member reachable via several same-depth paths) otherwise emit 2^d
  // copies of one logical edge. Identity is structural — same source,
  // target, effect, metadata and flags — so merging changes nothing
  // downstream.
  // (Traversal still visits shared subtrees repeatedly; composition-time
  // cost on developer-authored schemas only, no output explosion.)
  const emittedKeys = new Set<string>();
  const pushUnique = (rels: InternalRelationship[]): void => {
    for (const rel of rels) {
      const key = JSON.stringify(rel);
      if (!emittedKeys.has(key)) {
        emittedKeys.add(key);
        relationships.push(rel);
      }
    }
  };
  for (const entry of normalizeItemSchemas(item)) {
    if (seen.has(entry)) continue;
    seen.add(entry);
    try {
      const segment = { type: 'item', binding } as const;
      const slots = entry as unknown as Record<symbol, unknown>;
      const itemRels =
        (slots[RESOLVED_RELATIONSHIPS] as InternalRelationship[] | undefined) ||
        [];
      if (itemRels.length > 0) {
        pushUnique(rebaseRelationships(itemRels, [...prefix, segment]));
      }
      const nested = slots[ITEM_SCHEMA];
      if (nested !== undefined) {
        pushUnique(
          collectItemRelationships(
            nested,
            [...prefix, segment],
            `${binding}.$item`,
            seen,
          ),
        );
      }
    } finally {
      seen.delete(entry);
    }
  }
  return relationships;
}

/**
 * Normalizes an ITEM_SCHEMA slot to a list of item rules. Single-rule
 * containers (record values, single-rule arrays) store the rule directly;
 * multi-member containers (tuple elements, multi-rule arrays) store a list.
 * Duplicate references within one list (e.g. a literal `isArrayOf(x, x)`)
 * collapse to a single entry — each emits identical edges.
 */
function normalizeItemSchemas(item: unknown): Record<PropertyKey, unknown>[] {
  if (!item) return [];
  const entries = Array.isArray(item) ? item : [item];
  const out: Record<PropertyKey, unknown>[] = [];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    if (!out.includes(entry as Record<PropertyKey, unknown>)) {
      out.push(entry as Record<PropertyKey, unknown>);
    }
  }
  return out;
}

/**
 * Whether a rule carries an item relationship graph: either a shape-like
 * rule (has __schema), a rule with resolved relationships, or a container
 * whose own item slot holds the graph one hop further down (nested
 * arrays/records/tuples — collectItemRelationships recurses into these).
 */
function isItemSchemaLike(rule: unknown): rule is Record<PropertyKey, unknown> {
  if (!rule || typeof rule !== 'object') return false;
  const candidate = rule as unknown as {
    __schema?: unknown;
  } & Record<symbol, unknown>;
  return (
    candidate.__schema !== undefined ||
    candidate[RESOLVED_RELATIONSHIPS] !== undefined ||
    candidate[ITEM_SCHEMA] !== undefined
  );
}

/**
 * Relationship-aware record wrapper: attaches the value rule (record(value)
 * or record(key, value)) as the item schema, mirroring the single-object
 * ITEM_SCHEMA pattern, so describe() rebases the value shape's item graph.
 * Key rules are scalars and carry no item graph of their own.
 */
function createRecordWrapper(): (
  arg1: unknown,
  arg2?: unknown,
) => RuleInstance<unknown, unknown[]> {
  return (arg1: unknown, arg2?: unknown) => {
    const recordRule = recordEvaluators.record as (
      ...args: unknown[]
    ) => RuleInstance<unknown, unknown[]>;
    const rule = arg2 !== undefined ? recordRule(arg1, arg2) : recordRule(arg1);
    const valueRule = arg2 !== undefined ? arg2 : arg1;
    // Store every object value rule — not just graph-carrying ones — so
    // per-member execution (e.g. suite.changed() projection) can reach
    // primitive members too. describe() output is unchanged: members
    // without resolved relationships simply contribute no edges.
    // (Lazy RuleInstances are always objects — chain proxies — so the
    // object gate cannot silently drop a real member rule.)
    if (isObject(valueRule)) {
      const slots = rule as unknown as Record<symbol, unknown>;
      slots[ITEM_SCHEMA] = valueRule;
      slots[ITEM_CONTAINER] = 'record' as ItemContainerKind;
    }
    return rule;
  };
}

function wrapOptional(rawOptional: (inner: any) => RuleInstance<any, [any]>) {
  return (inner: any) => {
    const innerResolved = inner?.[RESOLVED_RELATIONSHIPS];
    const innerUnresolved = inner?.[UNRESOLVED_DEPS];
    // Use adapted rule to get lazy RuleInstance that preserves chain behavior
    const rule = rawOptional(inner);
    const slots = rule as unknown as Record<PropertyKey, unknown>;
    if (innerResolved?.length) {
      slots[RESOLVED_RELATIONSHIPS] = [...innerResolved];
    }
    if (innerUnresolved?.length) {
      slots[UNRESOLVED_DEPS] = [...innerUnresolved];
    }
    // Also copy __schema and ITEM_SCHEMA if present
    if (inner?.__schema && !slots.__schema) {
      slots.__schema = inner.__schema;
    }
    if (inner?.[ITEM_SCHEMA] && !slots[ITEM_SCHEMA]) {
      slots[ITEM_SCHEMA] = inner[ITEM_SCHEMA];
    }
    if (inner?.[ITEM_CONTAINER] && !slots[ITEM_CONTAINER]) {
      slots[ITEM_CONTAINER] = inner[ITEM_CONTAINER];
    }
    return rule;
  };
}

// Explicitly adapt only the schema modifiers that act as wrappers — now relationship-aware
const rawOptionalBase = adaptDynamicRules<
  RuleInstance<any, [any]>,
  Pick<typeof schemaRules, 'optional'>
>({ optional: schemaRules.optional } as any) as any;
const optionalWrapper = wrapOptional(rawOptionalBase.optional);

// For partial/pick/omit we need relationship-aware versions that also resolve
function createPartialWrapper() {
  return (schema: any) => {
    const relationships = collectSchemaRelationships(schema);
    const base = adaptDynamicRules<
      RuleInstance<any, [any]>,
      Pick<typeof schemaRules, 'partial'>
    >({
      partial: schemaRules.partial,
    } as any) as any;
    const rule = base.partial(schema);
    (rule as any)[RESOLVED_RELATIONSHIPS] = relationships;
    rule.__schema = schema;
    return rule;
  };
}

function rootedTopKey(
  path: Array<{ type?: unknown; key?: unknown }>,
): string | null {
  const [first] = path;
  return first && first.type === 'property' ? String(first.key) : null;
}

// Every rooted endpoint of a projected edge must resolve inside the
// projection: `isKept` answers whether a top-level key survived pick/omit.
function rootedEndpointsKept(
  rel: InternalRelationship,
  isKept: (top: string) => boolean,
): boolean {
  if ((rel as { __isRootSource?: boolean }).__isRootSource === true) {
    const top = rootedTopKey(
      rel.source as Array<{ type?: unknown; key?: unknown }>,
    );
    if (top && !isKept(top)) return false;
  }
  if ((rel as { __isRootTarget?: boolean }).__isRootTarget === true) {
    const top = rootedTopKey(
      rel.target as Array<{ type?: unknown; key?: unknown }>,
    );
    if (top && !isKept(top)) return false;
  }
  return true;
}

function createPickWrapper() {
  return (
    schema: Record<PropertyKey, unknown>,
    keys: PropertyKey | PropertyKey[],
  ) => {
    const keysSet = new Set(asArray(keys));
    let relationships = collectSchemaRelationships(
      schema as Record<string, any>,
      key => keysSet.has(key as string),
    );
    // Filter fully rebased set: keep only relationships where both endpoints' top-level keys are kept.
    // For rooted relationships, ignore the rooted endpoint as above.

    relationships = relationships.filter(rel => {
      const isRootSource = (rel as any).__isRootSource === true;
      const isRootTarget = (rel as any).__isRootTarget === true;
      if (isRootSource && !isRootTarget) {
        const tTop =
          rel.target[0]?.type === 'property'
            ? String((rel.target[0] as any).key)
            : null;
        return tTop ? keysSet.has(tTop) : true;
      }
      if (isRootTarget && !isRootSource) {
        const sTop =
          rel.source[0]?.type === 'property'
            ? String((rel.source[0] as any).key)
            : null;
        return sTop ? keysSet.has(sTop) : true;
      }
      if (isRootSource && isRootTarget) return true;
      const sTop =
        rel.source[0]?.type === 'property'
          ? String((rel.source[0] as any).key)
          : null;
      const tTop =
        rel.target[0]?.type === 'property'
          ? String((rel.target[0] as any).key)
          : null;
      const sKept = sTop ? keysSet.has(sTop) : true;
      const tKept = tTop ? keysSet.has(tTop) : true;
      return sKept && tKept;
    });
    // A projection only carries edges fully resolvable within itself: drop
    // rooted edges whose provider was picked away. Dependent expansion
    // already ran on the full graph, and the run-time rooted boundary would
    // otherwise reject the focused run.
    relationships = relationships.filter(rel =>
      rootedEndpointsKept(rel, top => keysSet.has(top)),
    );
    const base = adaptDynamicRules<
      RuleInstance<any, [any]>,
      Pick<typeof schemaRules, 'pick'>
    >({
      pick: schemaRules.pick,
    } as any) as any;
    const rule = base.pick(schema, keys);
    (rule as any)[RESOLVED_RELATIONSHIPS] = relationships;
    // For pick, __schema is filtered shape
    const filtered: any = {};
    const set = new Set(asArray(keys));
    for (const k of Object.keys(schema))
      if (set.has(k)) filtered[k] = schema[k];
    rule.__schema = filtered;
    return rule;
  };
}

function createOmitWrapper() {
  return (
    schema: Record<PropertyKey, unknown>,
    keys: PropertyKey | PropertyKey[],
  ) => {
    const keysSet = new Set(asArray(keys));
    let relationships = collectSchemaRelationships(
      schema as Record<string, any>,
      key => !keysSet.has(key as string),
    );
    // Filter fully rebased set: keep only relationships where both endpoints' top-level keys are not omitted.
    // For rooted, filter only by local endpoint as above.

    relationships = relationships.filter(rel => {
      const isRootSource = (rel as any).__isRootSource === true;
      const isRootTarget = (rel as any).__isRootTarget === true;
      if (isRootSource && !isRootTarget) {
        const tTop =
          rel.target[0]?.type === 'property'
            ? String((rel.target[0] as any).key)
            : null;
        return tTop ? !keysSet.has(tTop) : true;
      }
      if (isRootTarget && !isRootSource) {
        const sTop =
          rel.source[0]?.type === 'property'
            ? String((rel.source[0] as any).key)
            : null;
        return sTop ? !keysSet.has(sTop) : true;
      }
      if (isRootSource && isRootTarget) return true;
      const sTop =
        rel.source[0]?.type === 'property'
          ? String((rel.source[0] as any).key)
          : null;
      const tTop =
        rel.target[0]?.type === 'property'
          ? String((rel.target[0] as any).key)
          : null;
      const sKept = sTop ? !keysSet.has(sTop) : true;
      const tKept = tTop ? !keysSet.has(tTop) : true;
      return sKept && tKept;
    });
    // Same projection rule as pick: drop rooted edges whose provider was
    // omitted so focused runs stay self-contained.
    relationships = relationships.filter(rel =>
      rootedEndpointsKept(rel, top => !keysSet.has(top)),
    );
    const base = adaptDynamicRules<
      RuleInstance<unknown, [unknown]>,
      Pick<typeof schemaRules, 'omit'>
    >({
      omit: schemaRules.omit,
    } as unknown as Pick<typeof schemaRules, 'omit'>) as unknown as {
      omit: (s: unknown, k: unknown) => RuleInstance<unknown, unknown[]>;
    };
    const rule = base.omit(schema as unknown, keys as unknown);
    (rule as unknown as Record<symbol, unknown>)[RESOLVED_RELATIONSHIPS] =
      relationships;
    const filtered: Record<string, unknown> = {};
    const set = new Set(asArray(keys));
    for (const k of Object.keys(schema as object))
      if (!set.has(k)) filtered[k] = (schema as Record<string, unknown>)[k];
    (rule as unknown as { __schema: unknown }).__schema = filtered;
    return rule;
  };
}

const schemaModifiers = {
  optional: optionalWrapper,
  partial: createPartialWrapper(),
  pick: createPickWrapper(),
  omit: createOmitWrapper(),
} as any;

// Explicitly adapt the base schema evaluators that need __schema exposure
const schemaEvaluators = adaptDynamicRules<
  RuleInstance<any, [any]>,
  Pick<typeof schemaRules, 'shape' | 'loose'>
>({
  shape: schemaRules.shape,
  loose: schemaRules.loose,
});

const recordEvaluators = adaptDynamicRules<
  RuleInstance<any, [any]>,
  Pick<typeof schemaRules, 'record'>
>({
  record: schemaRules.record,
});

/**
 * Wraps a lazy schema evaluator so the resulting RuleInstance carries
 * a `__schema` reference to the original schema definition.
 * Downstream code (e.g. vest's focus/only filtering) reads `__schema`
 * to introspect the schema keys. Treat `__schema` as internal metadata.
 */
const schemaAttacher =
  (ruleFn: (schema: any) => RuleInstance<any, [any]>) => (schema: any) => {
    const relationships = collectSchemaRelationships(schema);

    /** @deferred v2 — effect:'revalidate' deferred, only 'invalidate' supported in V1 */
    for (const rel of relationships) {
      if ((rel as any).effect !== 'invalidate') {
        throw new Error(
          `effect:'${(rel as any).effect}' deferred to v2 — only 'invalidate' supported in V1`,
        );
      }
    }

    const rule = ruleFn(schema);
    rule.__schema = schema;
    (rule as any)[RESOLVED_RELATIONSHIPS] = relationships;
    return rule;
  };

// Build the final schema rules object with special handling for arrays and base evaluators
const schemaRulesWithArrayChaining = {
  ...schemaModifiers,

  isArrayOf: <T>(...rules: any[]): ArrayRuleInstance<T> => {
    const rule = addToChain<ArrayRuleInstance<T>>(arrayRules, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.isArrayOf(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    });
    // Store the single member rule (graph-carrying or primitive) so
    // per-member execution can reach it; describe() rebasing skips
    // members without resolved relationships, so output is unchanged.
    // (Lazy RuleInstances are always objects — chain proxies — so the
    // object gate cannot silently drop a real member rule.)
    const slots = rule as unknown as Record<symbol, unknown>;
    if (rules.length === 1 && isObject(rules[0])) {
      slots[ITEM_SCHEMA] = rules[0];
      slots[ITEM_CONTAINER] = 'array' as ItemContainerKind;
    } else if (rules.length > 1) {
      // Multi-rule arrays accept an element matching ANY member rule (union
      // semantics), so no single member owns the item graph. Store every
      // graph-carrying member: describe() rebases the union of their edges
      // under the same $item binding. This over-approximates (an edge fires
      // for indices whose element matched a different member), but that is
      // the invalidation-safe direction — and never a silent empty graph.
      const schemas = rules.filter(isItemSchemaLike);
      if (schemas.length > 0) {
        slots[ITEM_SCHEMA] = schemas;
        slots[ITEM_CONTAINER] = 'array' as ItemContainerKind;
      }
    }
    return rule;
  },
  lazy: lazyRule,

  list: <T>(...rules: any[]): ArrayRuleInstance<T> => {
    const rule = addToChain<ArrayRuleInstance<T>>(arrayRules, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.isArrayOf(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    });
    const slots = rule as unknown as Record<symbol, unknown>;
    if (rules.length === 1 && isObject(rules[0])) {
      slots[ITEM_SCHEMA] = rules[0];
      slots[ITEM_CONTAINER] = 'array' as ItemContainerKind;
    } else if (rules.length > 1) {
      // Same union semantics as isArrayOf above: keep every graph-carrying
      // member so describe() rebases the union instead of dropping the graph.
      const schemas = rules.filter(isItemSchemaLike);
      if (schemas.length > 0) {
        slots[ITEM_SCHEMA] = schemas;
        slots[ITEM_CONTAINER] = 'array' as ItemContainerKind;
      }
    }
    return rule;
  },
  loose: schemaAttacher(schemaEvaluators.loose),
  record: createRecordWrapper(),
  shape: schemaAttacher(schemaEvaluators.shape),
  tuple: (...rules: any[]) => {
    const rule = addToChain(arrayRules, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.tuple(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    });
    // Tuple elements are positional, but relationships inside an element are
    // still same-item edges. Collect every graph-carrying element so
    // describe() rebases the union under the $item binding (same union
    // semantics as multi-rule arrays above — over-approximating, never empty).
    const schemas = rules.filter(isItemSchemaLike);
    if (schemas.length > 0) {
      // No ITEM_CONTAINER here: tuple members are positional, and vest
      // readers discriminate list slots with Array.isArray without ever
      // consulting the kind for them — so an absent kind cannot misroute.
      (rule as unknown as Record<symbol, unknown>)[ITEM_SCHEMA] = schemas;
    }
    return rule;
  },
};

const baseEnforceLazy = {
  ...(adaptDynamicRules<RuleInstance<any, [any]>, typeof compoundRules>(
    compoundRules,
  ) as CompoundRuleLazyTypes),
  ...(schemaRulesWithArrayChaining as SchemaRuleLazyTypes),
  ...adaptDynamicRules<AnyRuleInstance, typeof generalRules>(generalRules),
  ...adaptDynamicRules<ObjectRulesUnion, typeof objectRules>(objectRules),
  ...typeRules,
};

/**
 * Lazy (builder) API for creating reusable validation rules.
 * Rules are created without a value and can be executed later with `run()` or `test()`.
 *
 * This is the builder pattern side of the enforce API - rules are chainable and reusable.
 *
 * @example
 * ```typescript
 * // Create reusable rules
 * const stringRule = enforce.isString();
 * const emailRule = enforce.isString().matches(/@/);
 *
 * // Test with values
 * stringRule.test('hello'); // true
 * stringRule.test(123); // false
 *
 * // Run for detailed results
 * const result = emailRule.run('user@example.com');
 * console.log(result.pass); // true
 *
 * // Chain type-specific rules
 * const ageRule = enforce.isNumber()
 *   .greaterThanOrEquals(18)
 *   .lessThan(150);
 *
 * // Schema validation
 * const userSchema = enforce.shape({
 *   name: enforce.isString(),
 *   email: enforce.isString().matches(/@/),
 *   age: ageRule
 * });
 *
 * userSchema.test({ name: 'John', email: 'john@example.com', age: 25 }); // true
 * ```
 */
export const enforceLazy = baseEnforceLazy as unknown as TCustomLazyRules &
  typeof baseEnforceLazy;
