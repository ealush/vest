import { greaterThan, isFunction, longerThan } from 'vest-utils';

import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Validates that a value is a fixed-length array (tuple) where each position
 * matches the corresponding rule. Enforces exact length unless trailing
 * elements use enforce.optional().
 *
 * Parsed values are propagated: if a rule transforms its input (e.g. toNumber),
 * the parsed tuple returned via `.parse()` carries the transformed values.
 *
 * @param value - The array to validate
 * @param rules - One RuleInstance per tuple position
 * @returns RuleRunReturn indicating success or failure, with `.type` holding
 *          the parsed tuple on success
 *
 * @example
 * ```typescript
 * // Eager API
 * enforce(['hello', 42]).tuple(enforce.isString(), enforce.isNumber());
 *
 * // Lazy API
 * const coordSchema = enforce.tuple(enforce.isNumber(), enforce.isNumber());
 * coordSchema.test([40.7, -74.0]); // true
 * coordSchema.test([40.7]);        // false — too few
 * coordSchema.test([40.7, -74, 0]);// false — too many
 * ```
 */
export function tuple(value: unknown, ...rules: any[]): RuleRunReturn<any> {
  if (!Array.isArray(value)) return RuleRunReturn.Failing(value);

  // Determine minimum required length (all rules minus trailing optionals)
  const requiredCount = countRequired(rules);

  // Reject arrays that are too short or too long
  if (
    greaterThan(requiredCount, value.length) ||
    longerThan(value, rules.length)
  ) {
    return RuleRunReturn.Failing(value);
  }

  return validateElements(value, rules);
}

/**
 * Counts the number of required (non-optional) leading positions by scanning
 * backwards from the end of the rules array. Stops at the first non-optional
 * rule, so only *trailing* optionals reduce the required count.
 */
function countRequired(rules: any[]): number {
  let count = rules.length;
  for (let i = rules.length - 1; i >= 0; i--) {
    if (isOptionalRule(rules[i])) count = i;
    else break;
  }
  return count;
}

/**
 * Iterates over each rule position, validates the corresponding array element,
 * and collects parsed output values. Returns early on the first failing element
 * with an index-based error path.
 */
function validateElements(value: any[], rules: any[]): RuleRunReturn<any> {
  const parsedTuple: any[] = [];

  for (let i = 0; i < rules.length; i++) {
    // Skip positions beyond the array length (only reached for trailing optionals)
    if (isBeyondArrayEnd(value, i, rules[i])) continue;

    const res = runElementRule(value[i], rules[i], i);

    if (!res.pass) return elementFailure(value, res, i);

    // Use the parsed value (res.type) if the rule transformed it, otherwise keep the original
    parsedTuple.push(res.type ?? value[i]);
  }

  return RuleRunReturn.Passing(parsedTuple);
}

/**
 * Checks whether the given index is past the array's actual length
 * and the corresponding rule is optional, meaning it can be skipped.
 */
function isBeyondArrayEnd(value: any[], index: number, rule: any): boolean {
  return index >= value.length && isOptionalRule(rule);
}

/**
 * Runs a single element's rule within an enforce context that carries
 * the element value and its positional index as metadata.
 */
function runElementRule(
  item: any,
  rule: any,
  index: number,
): RuleRunReturn<any> {
  return ctx.run({ value: item, set: true, meta: { index } }, () =>
    rule.run(item),
  );
}

/**
 * Builds a failing RuleRunReturn with an error path that includes the
 * tuple index, prepended to any nested path from the inner rule failure.
 * For example, a shape failure at index 1 on key "id" yields path ["1", "id"].
 */
function elementFailure(
  value: any[],
  res: RuleRunReturn<any>,
  index: number,
): RuleRunReturn<any> {
  const failure = RuleRunReturn.Failing(value, res.message);
  failure.issue = res.issue;
  failure.path = [index.toString(), ...(res.path || [])];
  return failure;
}

/**
 * Determines whether a rule is optional by testing if it passes with undefined.
 * This mirrors how shape/loose detect optional fields — a rule wrapping
 * enforce.optional() will pass for undefined, while required rules will not.
 */
function isOptionalRule(rule: RuleInstance<any, any>): boolean {
  if (!rule || !isFunction(rule.test)) return false;
  return rule.test(undefined);
}

/**
 * Maps a tuple of RuleInstances to their inferred output types.
 * [RuleInstance<string>, RuleInstance<number>] → [string, number]
 */
type InferTuple<T extends RuleInstance<any, any>[]> = {
  [K in keyof T]: T[K] extends RuleInstance<infer R, any> ? R : never;
};

/**
 * Maps a tuple of RuleInstances to their inferred input types.
 * Used for the Args parameter of the returned RuleInstance so that
 * .test() and .parse() accept correctly typed tuple input.
 */
type InferTupleInput<T extends RuleInstance<any, any>[]> = {
  [K in keyof T]: T[K] extends RuleInstance<any, [infer A, ...any[]]>
    ? A
    : never;
};

/**
 * The RuleInstance type returned by enforce.tuple().
 * Infers both output and input types from the provided rule tuple.
 */
export type TupleRuleInstance<T extends RuleInstance<any, any>[]> =
  RuleInstance<InferTuple<T>, [InferTupleInput<T>]>;
