/* eslint-disable complexity -- schema relationship rebasing */
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
import { ctx } from './enforceContext';
import { RuleRunReturn } from './utils/RuleRunReturn';
import {
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
  resolveInlineDeps,
} from './schema/dependencyResolver';
import {
  rebaseRelationships,
  rebaseRelationshipsForArray,
} from './schema/rebase';
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

// eslint-disable-next-line complexity
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
    const item = fieldRule?.[ITEM_SCHEMA] as any;
    if (item) {
      const itemRels =
        (item[RESOLVED_RELATIONSHIPS] as InternalRelationship[] | undefined) ||
        [];
      if (itemRels.length > 0) {
        relationships.push(
          ...rebaseRelationshipsForArray(itemRels, key, `${String(key)}.$item`),
        );
      }
    }
  }
  return relationships;
}

function wrapOptional(rawOptional: (inner: any) => RuleInstance<any, [any]>) {
  return (inner: any) => {
    const innerResolved = inner?.[RESOLVED_RELATIONSHIPS];
    const innerUnresolved = inner?.[UNRESOLVED_DEPS];
    // Use adapted rule to get lazy RuleInstance that preserves chain behavior
    const rule = rawOptional(inner);
    if (innerResolved?.length) {
      (rule as any)[RESOLVED_RELATIONSHIPS] = [...innerResolved];
    }
    if (innerUnresolved?.length) {
      (rule as any)[UNRESOLVED_DEPS] = [...innerUnresolved];
    }
    // Also copy __schema and ITEM_SCHEMA if present
    if (inner?.__schema && !(rule as any).__schema) {
      (rule as any).__schema = inner.__schema;
    }
    if (inner?.[ITEM_SCHEMA] && !(rule as any)[ITEM_SCHEMA]) {
      (rule as any)[ITEM_SCHEMA] = inner[ITEM_SCHEMA];
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

// eslint-disable-next-line complexity
function createPickWrapper() {
  return (
    schema: Record<PropertyKey, unknown>,
    keys: PropertyKey | PropertyKey[],
  ) => {
    const keysSet = new Set(Array.isArray(keys) ? keys : [keys]);
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
    const set = new Set(Array.isArray(keys) ? keys : [keys]);
    for (const k of Object.keys(schema))
      if (set.has(k)) filtered[k] = schema[k];
    rule.__schema = filtered;
    return rule;
  };
}

// eslint-disable-next-line complexity
function createOmitWrapper() {
  return (
    schema: Record<PropertyKey, unknown>,
    keys: PropertyKey | PropertyKey[],
  ) => {
    const keysSet = new Set(Array.isArray(keys) ? keys : [keys]);
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
    const set = new Set(Array.isArray(keys) ? keys : [keys]);
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
    // Store item schema for relationship rebasing if single schema arg
    if (rules.length === 1 && rules[0] && typeof rules[0] === 'object') {
      const itemSchema = rules[0] as any;
      if (itemSchema.__schema || itemSchema[RESOLVED_RELATIONSHIPS]) {
        (rule as any)[ITEM_SCHEMA] = itemSchema;
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
    if (rules.length === 1 && rules[0] && typeof rules[0] === 'object') {
      const itemSchema = rules[0] as any;
      if (itemSchema.__schema || itemSchema[RESOLVED_RELATIONSHIPS]) {
        (rule as any)[ITEM_SCHEMA] = itemSchema;
      }
    }
    return rule;
  },
  loose: schemaAttacher(schemaEvaluators.loose),
  record: recordEvaluators.record,
  shape: schemaAttacher(schemaEvaluators.shape),
  tuple: (...rules: any[]) =>
    addToChain(arrayRules, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.tuple(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    }),
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
