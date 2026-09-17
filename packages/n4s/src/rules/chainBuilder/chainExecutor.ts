import { hasOwnProperty, isObject } from 'vest-utils';

import { RuleRunReturn } from '../../utils/RuleRunReturn';

export type Predicate = (value: any) => boolean | RuleRunReturn<any>;

function isRuleRunReturn(result: any): result is RuleRunReturn<any> {
  return isObject(result) && 'pass' in result;
}

/**
 * Declared transform output preserved on a normalized parser result (A1).
 * Symbol-keyed so validation cannot observe it: it survives neither object
 * spread nor serialization, leaving failure payloads, paths, and messages
 * untouched. Only parser-only mapping reads it. Presence (not value)
 * carries the declaration, so an explicitly undefined parser output stays
 * distinguishable from a missing one.
 */
export const MAPPING_DECLARED_OUTPUT = Symbol.for('vest:mappingDeclaredOutput');

export function executeChain(
  chain: Predicate[],
  value: any,
): RuleRunReturn<any> {
  let currentValue = value;

  for (const predicate of chain) {
    const result = predicate(currentValue);

    if (isRuleRunReturn(result)) {
      if (!result.pass) return result as RuleRunReturn<any>;
      currentValue = result.type;
    } else if (!result) {
      return RuleRunReturn.Failing(currentValue);
    }
  }

  return RuleRunReturn.Passing(currentValue);
}

/**
 * Parser-only transform execution (A1). Unlike executeChain, a step's
 * validation verdict never short-circuits the mapping: each parser step's
 * declared transform output becomes the next step's input, so total parser
 * chains compose even when an intermediate verdict fails. Steps without a
 * declared output thread the value exactly as validation would (including
 * an explicitly undefined type); boolean steps declare no transform and
 * leave the threaded value untouched.
 */
export function executeMappingChain(
  chain: Predicate[],
  value: any,
): RuleRunReturn<any> {
  let currentValue = value;

  for (const predicate of chain) {
    const result = predicate(currentValue);

    if (isRuleRunReturn(result)) {
      const declared = (
        result as unknown as Record<
          typeof MAPPING_DECLARED_OUTPUT,
          { value: unknown } | undefined
        >
      )[MAPPING_DECLARED_OUTPUT];
      currentValue = declared !== undefined ? declared.value : result.type;
    }
  }

  return RuleRunReturn.Passing(currentValue);
}

export function declaredTransformOf(raw: unknown): {
  found: boolean;
  value?: unknown;
} {
  if (!isObject(raw)) return { found: false };
  if (raw instanceof RuleRunReturn) {
    return raw.type === undefined
      ? { found: false }
      : { found: true, value: raw.type };
  }
  return hasOwnProperty(raw, 'type')
    ? { found: true, value: (raw as { type: unknown }).type }
    : { found: false };
}
