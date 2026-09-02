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
import { resolveInlineDeps } from './schema/dependencyResolver';
import { rebaseRelationships } from './schema/rebase';
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

const RESOLVED = Symbol.for('vest:resolvedRelationships');
const UNRESOLVED = Symbol.for('vest:unresolvedDeps');
const ITEM_SCHEMA = Symbol.for('vest:itemSchema');

// eslint-disable-next-line complexity
function validateRootPathExists(
  path: any,
  rootShape: Record<string, any>,
  targetField: string,
): void {
  let current: any = rootShape;
  for (let i = 0; i < path.length; i++) {
    const seg = path[i];
    if (seg.type !== 'property') continue;
    const key = String(seg.key);
    if (!Object.prototype.hasOwnProperty.call(current, key)) {
      // Reuse EnforceSchemaError with Did you mean
      const { EnforceSchemaError } = require('./errors/EnforceSchemaError');
      const keys = Object.keys(current);
      // simple suggestion: closest via includes
      let suggestion: string | null = null;
      for (const k of keys) {
        if (k.toLowerCase().includes(key.toLowerCase().slice(0, 2))) {
          suggestion = k;
          break;
        }
      }
      let msg = `EnforceSchemaError: "${targetField}" depends on unknown field "${key}"`;
      if (suggestion) msg += `. Did you mean "${suggestion}"?`;
      throw new EnforceSchemaError(msg);
    }
    const rule = current[key];
    if (i < path.length - 1) {
      if (rule?.__schema) current = rule.__schema;
      else if (rule?.[ITEM_SCHEMA]) {
        const item = rule[ITEM_SCHEMA];
        current = item?.__schema ?? {};
      } else {
        // scalar with further path -> will be caught as missing next loop
        current = {};
      }
    }
  }
}



function wrapOptional(
  rawOptional: (inner: any) => RuleInstance<any, [any]>,
) {
  return (inner: any) => { // eslint-disable-line complexity
    const innerResolved = inner?.[RESOLVED];
    const innerUnresolved = inner?.[UNRESOLVED];
    // Use adapted rule to get lazy RuleInstance that preserves chain behavior
    const rule = rawOptional(inner);
    if (innerResolved?.length) {
      (rule as any)[RESOLVED] = [...innerResolved];
    }
    if (innerUnresolved?.length) {
      (rule as any)[UNRESOLVED] = [...innerUnresolved];
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
  return (schema: any) => { // eslint-disable-line complexity
    let relationships: any[] = [];
    try {
      relationships = resolveInlineDeps(schema, [], schema);
      for (const key of Object.keys(schema)) {
        const fieldRule = schema[key];
        const nested = fieldRule?.[RESOLVED] || [];
        if (nested.length > 0) {
          const prefix = [{ type: 'property', key } as const];
          relationships.push(...rebaseRelationships(nested, prefix));
        }
        const item = fieldRule?.[ITEM_SCHEMA];
        if (item) {
          const itemRels = item[RESOLVED] || [];
          if (itemRels.length > 0) {
            const binding = `${String(key)}.$item`;
            const prefix = [
              { type: 'property', key } as const,
              { type: 'item', binding } as const,
            ];
            relationships.push(...rebaseRelationships(itemRels, prefix));
          }
        }
      }
    } catch (e: any) {
      if (e?.name === 'EnforceSchemaError') throw e;
      throw e;
    }
    const base = adaptDynamicRules<RuleInstance<any, [any]>, Pick<typeof schemaRules, 'partial'>>({
      partial: schemaRules.partial,
    } as any) as any;
    const rule = base.partial(schema);
    (rule as any)[RESOLVED] = relationships;
    rule.__schema = schema;
    return rule;
  };
}

function createPickWrapper() {
  // eslint-disable-next-line complexity -- pick wrapper closes over schema graph
  return (schema: Record<PropertyKey, unknown>, keys: PropertyKey | PropertyKey[]) => {
    let relationships: InternalRelationship[] = [];
    try {
      const all = resolveInlineDeps(schema as Record<string, RuleInstance<unknown, unknown[]>>, [], schema as Record<string, unknown>);
      const keysSet = new Set(Array.isArray(keys) ? keys : [keys]);
      // Collect all (direct + rebased) then filter fully to avoid dangling after pick
      const collected: InternalRelationship[] = [];
      // eslint-disable-next-line complexity -- filter checks both endpoints
      const directKept = all.filter(rel => {
        const targetFirst = rel.target[0];
        const sourceFirst = rel.source[0];
        const tKey = targetFirst?.type === 'property' ? String(targetFirst.key) : null;
        const sKey = sourceFirst?.type === 'property' ? String(sourceFirst.key) : null;
        const targetKept = tKey ? keysSet.has(tKey) : true;
        const sourceKept = sKey ? keysSet.has(sKey) : true;
        return targetKept && sourceKept;
      });
      collected.push(...directKept);
      for (const key of Object.keys(schema)) {
        if (!keysSet.has(key as string)) continue;
        const fieldRule = (schema as Record<string, unknown>)[key] as unknown as Record<symbol, unknown>;
        const nested = (fieldRule?.[RESOLVED] as InternalRelationship[] | undefined) || [];
        if (nested.length > 0) {
          const prefix = [{ type: 'property', key } as const];
          collected.push(...rebaseRelationships(nested, prefix));
        }
        const item = fieldRule?.[ITEM_SCHEMA] as RuleInstance<unknown, unknown[]> | undefined;
        if (item) {
          const itemRels = (item as unknown as Record<symbol, unknown>)[RESOLVED] as InternalRelationship[] | undefined || [];
          if (itemRels.length > 0) {
            const binding = `${String(key)}.$item`;
            const prefix = [
              { type: 'property', key } as const,
              { type: 'item', binding } as const,
            ];
            collected.push(...rebaseRelationships(itemRels, prefix));
          }
        }
      }
      // Filter fully rebased set: pick keeps only relationships where both endpoints' top-level keys are kept
      // eslint-disable-next-line complexity -- filter checks both endpoints
      relationships = collected.filter(rel => {
        const sTop = rel.source[0]?.type === 'property' ? String((rel.source[0] as any).key) : null;
        const tTop = rel.target[0]?.type === 'property' ? String((rel.target[0] as any).key) : null;
        const sKept = sTop ? keysSet.has(sTop) : true;
        const tKept = tTop ? keysSet.has(tTop) : true;
        return sKept && tKept;
      });
    } catch (e: any) {
      if (e?.name === 'EnforceSchemaError') throw e;
      throw e;
    }
    const base = adaptDynamicRules<RuleInstance<any, [any]>, Pick<typeof schemaRules, 'pick'>>({
      pick: schemaRules.pick,
    } as any) as any;
    const rule = base.pick(schema, keys);
    (rule as any)[RESOLVED] = relationships;
    // For pick, __schema is filtered shape
    const filtered: any = {};
    const set = new Set(Array.isArray(keys) ? keys : [keys]);
    for (const k of Object.keys(schema)) if (set.has(k)) filtered[k] = schema[k];
    rule.__schema = filtered;
    return rule;
  };
}

function createOmitWrapper() {
  // eslint-disable-next-line complexity -- omit wrapper closes over schema graph
  return (schema: Record<PropertyKey, unknown>, keys: PropertyKey | PropertyKey[]) => {
    let relationships: InternalRelationship[] = [];
    try {
      const all = resolveInlineDeps(schema as Record<string, RuleInstance<unknown, unknown[]>>, [], schema as Record<string, unknown>);
      const keysSet = new Set(Array.isArray(keys) ? keys : [keys]);
      const collected: InternalRelationship[] = [];
      // eslint-disable-next-line complexity -- filter checks both endpoints
      const directKept = all.filter(rel => {
        const targetFirst = rel.target[0];
        const sourceFirst = rel.source[0];
        const tKey = targetFirst?.type === 'property' ? String(targetFirst.key) : null;
        const sKey = sourceFirst?.type === 'property' ? String(sourceFirst.key) : null;
        const targetKept = tKey ? !keysSet.has(tKey) : true;
        const sourceKept = sKey ? !keysSet.has(sKey) : true;
        return targetKept && sourceKept;
      });
      collected.push(...directKept);
      for (const key of Object.keys(schema)) {
        if (keysSet.has(key as string)) continue;
        const fieldRule = (schema as Record<string, RuleInstance<unknown, unknown[]>>)[key as string] as unknown as Record<symbol, unknown>;
        const nested = (fieldRule?.[RESOLVED] as InternalRelationship[] | undefined) || [];
        if (nested.length > 0) {
          const prefix = [{ type: 'property', key } as const];
          collected.push(...rebaseRelationships(nested, prefix));
        }
        const item = fieldRule?.[ITEM_SCHEMA] as RuleInstance<unknown, unknown[]> | undefined;
        if (item) {
          const itemRels = (item as unknown as Record<symbol, unknown>)[RESOLVED] as InternalRelationship[] | undefined || [];
          if (itemRels.length > 0) {
            const binding = `${String(key)}.$item`;
            const prefix = [
              { type: 'property', key } as const,
              { type: 'item', binding } as const,
            ];
            collected.push(...rebaseRelationships(itemRels, prefix));
          }
        }
      }
      // Filter fully rebased set: omit keeps only relationships where both endpoints' top-level keys are NOT omitted
      // eslint-disable-next-line complexity -- filter checks both endpoints
      relationships = collected.filter(rel => {
        const sTop = rel.source[0]?.type === 'property' ? String((rel.source[0] as any).key) : null;
        const tTop = rel.target[0]?.type === 'property' ? String((rel.target[0] as any).key) : null;
        const sKept = sTop ? !keysSet.has(sTop) : true;
        const tKept = tTop ? !keysSet.has(tTop) : true;
        return sKept && tKept;
      });
    } catch (e: unknown) {
      if ((e as Error)?.name === 'EnforceSchemaError') throw e;
      throw e;
    }
    const base = adaptDynamicRules<RuleInstance<unknown, [unknown]>, Pick<typeof schemaRules, 'omit'>>({
      omit: schemaRules.omit,
    } as unknown as Pick<typeof schemaRules, 'omit'>) as unknown as { omit: (s: unknown, k: unknown) => RuleInstance<unknown, unknown[]> };
    const rule = base.omit(schema as unknown, keys as unknown);
    (rule as unknown as Record<symbol, unknown>)[RESOLVED] = relationships;
    const filtered: Record<string, unknown> = {};
    const set = new Set(Array.isArray(keys) ? keys : [keys]);
    for (const k of Object.keys(schema as object)) if (!set.has(k)) filtered[k] = (schema as Record<string, unknown>)[k];
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
  (ruleFn: (schema: any) => RuleInstance<any, [any]>) =>
  // eslint-disable-next-line complexity
  (schema: any) => {
    // Collect relationships from shape fields before creating rule
    // so that validation errors (unknown field) are thrown at composition time
    let relationships: any[] = [];
    try {
      // Resolve direct field dependencies
      relationships = resolveInlineDeps(schema, [], schema);

      // Collect and rebase nested schema relationships
      for (const key of Object.keys(schema)) {
        const fieldRule = schema[key];
        if (!fieldRule) continue;
        // Check if it's a nested schema (has __schema and resolved relationships)
        const nestedRels =
          (fieldRule as any)[Symbol.for('vest:resolvedRelationships')] || [];
        if (nestedRels.length > 0) {
          // This is a nested schema — rebase its relationships
          const prefix = [{ type: 'property', key } as const];
          const rebased = rebaseRelationships(nestedRels, prefix);
          relationships.push(...rebased);
        }
        // Check if it's an array with item schema (has __itemSchema)
        const itemSchema = (fieldRule as any)[Symbol.for('vest:itemSchema')];
        if (itemSchema) {
          const itemRels =
            (itemSchema as any)[Symbol.for('vest:resolvedRelationships')] || [];
          if (itemRels.length > 0) {
            const itemBinding = `${String(key)}.$item`;
            const prefix = [
              { type: 'property', key } as const,
              { type: 'item', binding: itemBinding } as const,
            ];
            const rebased = rebaseRelationships(itemRels, prefix);
            relationships.push(...rebased);
          }
        }
      }
    } catch (e) {
      // Re-throw EnforceSchemaError
      if ((e as any)?.name === 'EnforceSchemaError') throw e;
      throw e;
    }

    /** @deferred v2 — effect:'revalidate' deferred, only 'invalidate' supported in V1 */
    for (const rel of relationships) {
      if ((rel as any).effect !== 'invalidate') {
        throw new Error(
          `effect:'${(rel as any).effect}' deferred to v2 — only 'invalidate' supported in V1`,
        );
      }
    }

    // Validate rooted paths — defer nested targets (intermediate composition)
    // Root dependencies from nested shapes (e.g., inner leaf -> $.root.global) have
    // targets like [inner, leaf] (length>1) or sources like [inner, leaf] for revalidates.
    // At intermediate shape creation (middle = shape({ inner })), global is not in middle's
    // top-level, but will be provided by outer shape({ global, middle }). Validating
    // immediately would incorrectly throw. Defer all rooted relationships where either
    // endpoint is nested (length>1); only validate direct top-level root deps immediately
    // (e.g., shape({ a, b: $.root.missing }) where both endpoints length===1 and missing).
    // Deferred nested roots are carried via rebase and validated at the outermost that
    // provides the key; if never provided, the suite will surface the stale dependency
    // (or describe will show it) rather than throwing at shape creation.
    for (const rel of relationships) {
      if ((rel as any).__isRootSource || (rel as any).__isRootTarget) {
        const isNested = rel.target.length > 1 || rel.source.length > 1;
        if (isNested) continue;
      }
      const targetKey = String(
        (rel.target[rel.target.length - 1] as any)?.key ?? 'unknown',
      );
      if ((rel as any).__isRootSource) {
        validateRootPathExists(rel.source, schema, targetKey);
      }
      if ((rel as any).__isRootTarget) {
        validateRootPathExists(rel.target, schema, targetKey);
      }
    }

    const rule = ruleFn(schema);
    rule.__schema = schema;
    (rule as any)[Symbol.for('vest:resolvedRelationships')] = relationships;
    return rule;
  };

// Build the final schema rules object with special handling for arrays and base evaluators
const schemaRulesWithArrayChaining = {
  ...schemaModifiers,
  // eslint-disable-next-line complexity
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
      if (
        itemSchema.__schema ||
        itemSchema[Symbol.for('vest:resolvedRelationships')]
      ) {
        (rule as any)[Symbol.for('vest:itemSchema')] = itemSchema;
      }
    }
    return rule;
  },
  lazy: lazyRule,
  // eslint-disable-next-line complexity
  list: <T>(...rules: any[]): ArrayRuleInstance<T> => {
    const rule = addToChain<ArrayRuleInstance<T>>(arrayRules, (value: any) => {
      const result = ctx.run({ value }, () =>
        schemaRules.isArrayOf(value, ...rules),
      );
      return RuleRunReturn.create(result, value);
    });
    if (rules.length === 1 && rules[0] && typeof rules[0] === 'object') {
      const itemSchema = rules[0] as any;
      if (
        itemSchema.__schema ||
        itemSchema[Symbol.for('vest:resolvedRelationships')]
      ) {
        (rule as any)[Symbol.for('vest:itemSchema')] = itemSchema;
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
