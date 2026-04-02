import { ctx } from '../../enforceContext';
import type { RuleInstance } from '../../utils/RuleInstance';
import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Validates that a value is a fixed-length array (tuple) where each position
 * matches the corresponding rule. Enforces exact length unless trailing
 * elements use enforce.optional().
 *
 * @param value - The array to validate
 * @param rules - One RuleInstance per tuple position
 * @returns RuleRunReturn indicating success or failure
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

  const requiredCount = countRequired(rules);

  if (value.length < requiredCount || value.length > rules.length) {
    return RuleRunReturn.Failing(value);
  }

  return validateElements(value, rules);
}

function countRequired(rules: any[]): number {
  let count = rules.length;
  for (let i = rules.length - 1; i >= 0; i--) {
    if (isOptionalRule(rules[i])) count = i;
    else break;
  }
  return count;
}

function validateElements(value: any[], rules: any[]): RuleRunReturn<any> {
  const parsedTuple: any[] = [];

  for (let i = 0; i < rules.length; i++) {
    if (isBeyondArrayEnd(value, i, rules[i])) continue;

    const res = runElementRule(value[i], rules[i], i);

    if (!res.pass) return elementFailure(value, res, i);

    parsedTuple.push(res.type ?? value[i]);
  }

  return RuleRunReturn.Passing(parsedTuple);
}

function isBeyondArrayEnd(value: any[], index: number, rule: any): boolean {
  return index >= value.length && isOptionalRule(rule);
}

function runElementRule(
  item: any,
  rule: any,
  index: number,
): RuleRunReturn<any> {
  return ctx.run({ value: item, set: true, meta: { index } }, () =>
    rule.run(item),
  );
}

function elementFailure(
  value: any[],
  res: RuleRunReturn<any>,
  index: number,
): RuleRunReturn<any> {
  const failure = RuleRunReturn.Failing(value, res.message);
  failure.path = [index.toString(), ...(res.path || [])];
  return failure;
}

/**
 * Checks whether a rule is an optional rule by testing if it passes
 * with undefined (the same way shape detects optional fields).
 */
function isOptionalRule(rule: RuleInstance<any, any>): boolean {
  if (!rule || typeof rule.test !== 'function') return false;
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
 * Used for the Args parameter of the returned RuleInstance.
 */
type InferTupleInput<T extends RuleInstance<any, any>[]> = {
  [K in keyof T]: T[K] extends RuleInstance<any, [infer A, ...any[]]>
    ? A
    : never;
};

export type TupleRuleInstance<T extends RuleInstance<any, any>[]> =
  RuleInstance<InferTuple<T>, [InferTupleInput<T>]>;
