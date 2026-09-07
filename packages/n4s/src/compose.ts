import { StringObject, assign, invariant } from 'vest-utils';
import type { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

import { ctx } from './enforceContext';
import {
  COMPOSITION_CHILDREN,
  ITEM_CONTAINER,
  ITEM_SCHEMA,
  RESOLVED_RELATIONSHIPS,
  UNRESOLVED_DEPS,
} from './schema/schemaSlots';
import {
  MAP_FULL_VALUE,
  mapWithoutValidation,
} from './schema/mapWithoutValidation';
import { RuleInstance } from './utils/RuleInstance';
import { RuleRunReturn } from './utils/RuleRunReturn';

type ComposableRule = {
  readonly '~standard': {
    readonly types?: StandardSchemaV1.Types<unknown, unknown>;
  };
  run(value: never): RuleRunReturn<unknown>;
};

type RuleInput<Rule> = Rule extends {
  readonly '~standard': {
    readonly types: StandardSchemaV1.Types<infer Input, unknown>;
  };
}
  ? Input
  : unknown;

type RuleOutput<Rule> = Rule extends {
  readonly '~standard': {
    readonly types: StandardSchemaV1.Types<unknown, infer Output>;
  };
}
  ? Output
  : unknown;

type FirstRule<Rules extends readonly ComposableRule[]> =
  Rules extends readonly [infer First extends ComposableRule, ...unknown[]]
    ? First
    : never;

type LastRule<Rules extends readonly ComposableRule[]> =
  Rules extends readonly [...unknown[], infer Last extends ComposableRule]
    ? Last
    : never;

type ComposeInput<Rules extends readonly ComposableRule[]> =
  Rules extends readonly [] ? unknown : RuleInput<FirstRule<Rules>>;

type ComposeOutput<Rules extends readonly ComposableRule[]> =
  Rules extends readonly [] ? unknown : RuleOutput<LastRule<Rules>>;

type ComposeResult<Input, Output> = RuleInstance<Output, [Input]> & {
  (value: Input): void;
};

/**
 * Composes multiple validation rules into a single reusable rule.
 * The composed rule executes rules in order and fails on the first failing rule.
 * Returns a RuleInstance that can be used with both eager and lazy APIs.
 *
 * @template Rules - The ordered rules whose first input and final output
 * determine the composed rule's public types.
 * @param composites - Validation rules to compose
 * @returns A composed rule that can be run with values or called directly
 *
 * @example
 * ```typescript
 * // Create a reusable adult age validation
 * const isAdult = compose(
 *   enforce.isNumber(),
 *   enforce.greaterThanOrEquals(18),
 *   enforce.lessThan(150)
 * );
 *
 * isAdult.test(25); // true
 * isAdult.test(16); // false
 *
 * enforce(30).run(isAdult); // passes
 *
 * isAdult(25); // ok
 * isAdult(16); // throws
 *
 * const userSchema = enforce.shape({
 *   age: isAdult,
 *   name: enforce.isString()
 * });
 * ```
 */
export function compose<const Rules extends readonly ComposableRule[]>(
  ...composites: Rules
): ComposeResult<ComposeInput<Rules>, ComposeOutput<Rules>> {
  type Input = ComposeInput<Rules>;
  type Output = ComposeOutput<Rules>;
  const instance = RuleInstance.create<
    RuleInstance<Output, [Input]>,
    Output,
    [Input]
  >(run);
  const composedFn = assign((value: Input) => {
    const res = run(value);
    invariant(res.pass, StringObject(res.message));
  }, instance);
  const result = composedFn as ComposeResult<Input, Output>;

  // Preserve every composite's dependency metadata. Multiple validation
  // chains may have different structural schemas, so only the unambiguous
  // single-child container slots are forwarded; relationship edges themselves
  // always have well-defined union semantics and are deduplicated below.
  forwardCompositionSlots(composites, [instance, result]);

  // RuleInstance.create() stores relationship metadata on its object. The
  // callable facade is the value mounted into schemas, so both identities
  // must carry identical slots. Keep dependencies added to the facade beside
  // the dependencies inherited from its composed children.
  const inheritedDependencies = readArraySlot(result, UNRESOLVED_DEPS);
  const addedDependencies: unknown[] = [];
  result.dependsOn = resolver => {
    addedDependencies.push({ resolver });
    for (const target of [instance, result]) {
      const slots = target as unknown as Record<symbol, unknown>;
      slots[UNRESOLVED_DEPS] = [...inheritedDependencies, ...addedDependencies];
    }
    return result;
  };

  return result;

  function run(value: Input): RuleRunReturn<Output> {
    return ctx.run({ value }, () => {
      let current: unknown = value;
      for (const composite of composites) {
        const executable = composite as unknown as {
          run(input: unknown): RuleRunReturn<unknown>;
        };
        const result = executable.run(current);
        if (!result.pass) return result as RuleRunReturn<Output>;
        current = result.type;
      }
      return RuleRunReturn.Passing(current as Output);
    });
  }
}

/**
 * Forwards schema metadata onto the composed rule. Relationship lists are
 * unioned and copied so later mounts cannot alias a source array. Structural
 * slots carry over only for a single unambiguous child. COMPOSITION_CHILDREN
 * retains every wrapper identity for graph traversal and root boundaries.
 */
// eslint-disable-next-line complexity -- metadata forwarding deliberately discriminates each independent slot
function forwardCompositionSlots(
  sources: readonly ComposableRule[],
  targets: readonly object[],
): void {
  const unresolved: unknown[] = [];
  const relationships = new Map<string, unknown>();

  for (const source of sources) {
    const from = source as unknown as Record<PropertyKey, unknown>;
    const sourceUnresolved = from[UNRESOLVED_DEPS];
    if (Array.isArray(sourceUnresolved)) unresolved.push(...sourceUnresolved);
    const sourceRelationships = from[RESOLVED_RELATIONSHIPS];
    if (Array.isArray(sourceRelationships)) {
      for (const relationship of sourceRelationships) {
        relationships.set(JSON.stringify(relationship), relationship);
      }
    }
  }

  const [single] = sources;
  for (const target of targets) {
    const to = target as Record<PropertyKey, unknown>;
    if (unresolved.length > 0) to[UNRESOLVED_DEPS] = [...unresolved];
    if (relationships.size > 0) {
      to[RESOLVED_RELATIONSHIPS] = Array.from(relationships.values());
    }
    if (sources.length === 1 && single) {
      const from = single as unknown as Record<PropertyKey, unknown>;
      for (const slot of ['__schema', ITEM_SCHEMA, ITEM_CONTAINER]) {
        if (from[slot] !== undefined) to[slot] = from[slot];
      }
    }
    to[COMPOSITION_CHILDREN] = [...sources];
    // A composition maps each source in sequence, including its structural
    // mapping. This full-value slot prevents mapWithoutValidation() from first
    // mapping the forwarded __schema and then mapping that same source again.
    to[MAP_FULL_VALUE] = mapComposedValue(sources);
  }
}

function mapComposedValue(
  sources: readonly ComposableRule[],
): (value: unknown) => RuleRunReturn<unknown> {
  return value =>
    RuleRunReturn.Passing(
      sources.reduce(
        (current, source) => mapWithoutValidation(source, current),
        value,
      ),
    );
}

function readArraySlot(source: object, slot: symbol): unknown[] {
  const value = (source as Record<PropertyKey, unknown>)[slot];
  return Array.isArray(value) ? [...value] : [];
}
