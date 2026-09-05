import { assign } from 'vest-utils';

import { enforceEager } from './eager';
import { ctx } from './enforceContext';
import type { EnforceContext } from './enforceContext';
import { extendEnforce } from './extendLogic';
import { enforceLazy } from './lazy';
import type { RuleInstance } from './utils/RuleInstance';

/**
 * Context API for accessing validation context.
 * Allows accessing metadata and parent validation context during rule execution.
 */
export { ctx } from './enforceContext';

/**
 * Compose multiple validation rules into a single reusable rule.
 * Returns a composed rule that can be used in both eager and lazy validation.
 *
 * @example
 * ```typescript
 * // Compose separate rules that apply to the same value
 * const isValidUsername = compose(
 *   enforce.isString()
 *     .longerThan(3)
 *     .shorterThan(20)
 *     .matches(/^[a-zA-Z0-9_]+$/)
 * );
 *
 * isValidUsername.test('john_doe'); // true
 * isValidUsername.test('ab'); // false (too short)
 * isValidUsername.test('john doe'); // false (contains space)
 *
 * // Use in schema validation
 * enforce({ username: 'john_doe' }).shape({
 *   username: isValidUsername
 * });
 * ```
 */
export { compose } from './compose';

/**
 * Public schema relationship introspection types.
 * Returned by `describe()` on schema rules.
 */
export type {
  ItemSegment,
  PropertySegment,
  SchemaPath,
} from './schema/SchemaPath';
export { isItemSegment, isPropertySegment } from './schema/SchemaPath';
export type {
  InternalRelationship,
  SchemaDependency,
  SchemaRelationship,
} from './schema/SchemaRelationship';
export type { DescribeResult } from './utils/RuleInstance';

/**
 * Escape hatch for referencing a literal field whose name collides with a
 * JavaScript internal (`then` is never chainable so refs stay non-thenable).
 *
 * @example
 * ```typescript
 * dependsOn($ => $[FIELD]('then'))
 * ```
 */
export { FIELD } from './schema/scopeProxy';

/**
 * Slot key for a container rule's item schema (single-rule arrays, record
 * values, tuple/multi-rule element lists). Exposed for suite-level
 * integration (e.g. dependency-aware `suite.changed()` projection) that
 * must read — never write — the slot.
 */
export { ITEM_SCHEMA, ITEM_CONTAINER } from './schema/dependencyResolver';
export type { ItemContainerKind } from './schema/dependencyResolver';
export {
  CHAIN_INFO,
  CHAIN_BASELINE,
  PARTIAL_LIKE,
  OPTIONAL_RULE,
} from './schema/dependencyResolver';
export type { ChainInfo } from './schema/dependencyResolver';
export type { ChainBaseline } from './schema/dependencyResolver';
export {
  chainBaselineMatches,
  hasChainBaseline,
} from './schema/dependencyResolver';
/**
 * Suite-creation finalizer for deferred (`$.root`) relationship endpoints.
 * Validates the mounted graph's rooted paths against the final root shape.
 *
 * @internal Kept exported only because Vest's `createSuite.ts` consumes it
 * and private-path imports are banned — not part of the supported public
 * API surface, which otherwise exposes only `runSchemaPaths` (plus its
 * types) and the canonical affected-path parser below.
 */
export { assertSchemaRootPathsValid } from './schema/dependencyResolver';
/**
 * Error thrown for schema composition and boundary violations (unknown
 * dependency fields, orphaned fragment sources). Public so consumers can
 * catch it by identity regardless of which entry built the schema.
 */
export { EnforceSchemaError } from './errors/EnforceSchemaError';
/**
 * The single contract for dependency-aware schema execution. The caller
 * passes raw changed fields; n4s owns changed→affected expansion,
 * container kinds, fragment projection, short-circuit supplementation,
 * chain-validator preservation, and member execution.
 */
export { resolveAffectedPaths, runSchemaPaths } from './schema/selectiveRun';
export { mapWithoutValidation } from './schema/mapWithoutValidation';
export type {
  SelectiveRunOptions,
  SelectiveSchema,
  SelectiveSchemaResult,
} from './schema/selectiveRun';
/**
 * Canonical affected-path parser shared by the selective engine and Vest's
 * suite.changed(). The projection internals (`buildProjectedSchema`,
 * `filterSchemaResultsToAffected`, `mergeSupplementalResults`) are not
 * re-exported here
 * — Vest production code reaches them only through `runSchemaPaths`.
 */
export { parseAffectedFieldName } from './schema/selectiveRun';
export type { ScopeHandle } from './utils/RuleInstance';
export type { SchemaMemberRule } from './rules/schemaRules/schemaRulesLazyTypes';

type ExtendOptions<Rules> = {
  parsers?: readonly (keyof Rules & string)[];
};
type ExtensionRule = (...args: never[]) => unknown;
type ExtendFn = <Rules extends Record<string, ExtensionRule>>(
  rules: Rules,
  options?: ExtendOptions<Rules>,
) => void;
type ContextFn = () => EnforceContext;
type Enforce = typeof enforceEager &
  typeof enforceLazy & { extend: ExtendFn; context: ContextFn };

export namespace enforce {
  export type infer<R extends RuleInstance<any, any>> = R['infer'];
}

/**
 * Main validation function supporting both eager (imperative) and lazy (builder) APIs.
 *
 * **Eager API (Imperative):**
 * Immediately validates a value with chainable assertions that execute on call.
 *
 * **Lazy API (Builder Pattern):**
 * Builds a reusable validation rule without a value, returns a RuleInstance.
 *
 * @example
 * ```typescript
 * // Eager API - validates immediately
 * enforce('hello').isString().longerThan(3);
 *
 * // Lazy API - builds a reusable rule
 * const stringRule = enforce.isString();
 * stringRule.test('hello'); // true
 * stringRule.run('hello'); // RuleRunReturn { pass: true, type: 'hello' }
 *
 * // Custom messages
 * enforce('').message('Field is required').isNotEmpty();
 *
 * // Schema validation
 * enforce({ name: 'John', age: 30 }).shape({
 *   name: enforce.isString(),
 *   age: enforce.isNumber()
 * });
 * ```
 */
export const enforce = assign(enforceEager, enforceLazy) as Enforce;

/**
 * Access the current validation context.
 * Returns metadata and parent context information during rule execution.
 *
 * @returns The current EnforceContext or null if not in validation context
 *
 * @example
 * ```typescript
 * const context = enforce.context();
 * console.log(context?.value); // Current value being validated
 * console.log(context?.meta);  // Metadata attached to context
 * ```
 */
enforce.context = function context(): EnforceContext {
  return ctx.use();
};

/**
 * Extend enforce with custom validation rules.
 * Custom rules become available on both eager and lazy APIs.
 *
 * @param rules - Object mapping rule names to validation functions
 * @param options.parsers - Custom rules that are safe to execute as pure
 * transformations when mapping an unfocused value. Rules are validators by
 * default and are never speculatively executed.
 *
 * @example
 * ```typescript
 * enforce.extend({
 *   isPositive: (value: number) => value > 0,
 *   isBetween: (value: number, min: number, max: number) =>
 *     value >= min && value <= max
 * });
 *
 * // Now use your custom rules
 * enforce(5).isPositive(); // eager API
 * const rule = enforce.isPositive(); // lazy API
 *
 * // With TypeScript, declare types:
 * declare global {
 *   namespace n4s {
 *     interface EnforceMatchers {
 *       isPositive: (value: number) => boolean;
 *       isBetween: (value: number, min: number, max: number) => boolean;
 *     }
 *   }
 * }
 * ```
 */
enforce.extend = function extend<Rules extends Record<string, ExtensionRule>>(
  rules: Rules,
  options?: ExtendOptions<Rules>,
) {
  extendEnforce(
    enforce as unknown as Record<string, unknown>,
    rules,
    new Set(options?.parsers),
  );
};
