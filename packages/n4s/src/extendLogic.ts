import { isFunction, isStringValue } from 'vest-utils';

import { extendEager } from './eager';
import { ctx } from './enforceContext';
import { EnforceSchemaError } from './errors/EnforceSchemaError';
import { addToChain, registerLazyRule } from './rules/genRuleChain';
import {
  declaredTransformOf,
  MAPPING_DECLARED_OUTPUT,
} from './rules/chainBuilder/chainExecutor';
import { RuleRunReturn } from './utils/RuleRunReturn';

type ExtensionRule = (...args: never[]) => unknown;
type MutableEnforce = Record<string, unknown>;

/**
 * Extends the enforce API with custom validation rules.
 * Custom rules are added to both eager and lazy APIs automatically.
 *
 * Rules receive the value as the first parameter, followed by any additional arguments.
 * They should return a boolean or RuleRunReturn.
 *
 * @param enforce - The enforce object to extend
 * @param rules - Object mapping rule names to validation functions
 *
 * @example
 * ```typescript
 * // Add custom rules
 * extendEnforce(enforce, {
 *   isPositive: (value: number) => value > 0,
 *   isBetween: (value: number, min: number, max: number) =>
 *     value >= min && value <= max,
 *   isEven: (value: number) => value % 2 === 0
 * });
 *
 * // Use in eager API
 * enforce(10).isPositive().isEven();
 * enforce(5).isBetween(1, 10);
 *
 * // Use in lazy API
 * const positiveRule = enforce.isPositive();
 * positiveRule.test(5); // true
 * positiveRule.test(-3); // false
 *
 * // Combine with built-in rules
 * const schema = enforce.shape({
 *   age: enforce.isNumber().isPositive().isBetween(18, 100),
 *   score: enforce.isNumber().isEven()
 * });
 * ```
 */
export function extendEnforce<Rules extends Record<string, ExtensionRule>>(
  enforce: MutableEnforce,
  rules: Rules,
  parserNames: readonly string[] = [],
) {
  const parsers = validateExtension(rules, parserNames);
  extendEager(rules);

  Object.keys(rules).forEach(ruleName => {
    registerExtensionRule(
      enforce,
      ruleName,
      rules[ruleName],
      parsers.has(ruleName),
    );
  });
}

function registerExtensionRule(
  enforce: MutableEnforce,
  ruleName: string,
  rule: ExtensionRule,
  mapsValue: boolean,
): void {
  const callableRule = rule as unknown as (
    value: unknown,
    ...args: unknown[]
  ) => unknown;
  const ruleWrapper = (value: unknown, ...args: unknown[]) => {
    const res = ctx.run({ value }, () => callableRule(value, ...args));
    const normalized = RuleRunReturn.create(
      res as boolean | RuleRunReturn<unknown>,
      value,
    );
    attachDeclaredTransform(normalized, res, mapsValue);
    return normalized;
  };

  enforce[ruleName] = (...args: unknown[]) =>
    addToChain({}, (value: unknown) => ruleWrapper(value, ...args), mapsValue);
  registerLazyRule(
    ruleName,
    (...args: unknown[]) =>
      (value: unknown) =>
        ruleWrapper(value, ...args),
    mapsValue,
  );
}

function attachDeclaredTransform(
  normalized: RuleRunReturn<unknown>,
  raw: unknown,
  mapsValue: boolean,
): void {
  // Parser-only mapping consumes each step's declared transform output even
  // when validation fails. The declaration rides alongside the normalized
  // validation payload, preserving verdicts, paths, types, and messages.
  if (!mapsValue) return;
  const declared = declaredTransformOf(raw);
  if (!declared.found) return;
  (
    normalized as unknown as Record<
      typeof MAPPING_DECLARED_OUTPUT,
      { value: unknown }
    >
  )[MAPPING_DECLARED_OUTPUT] = { value: declared.value };
}

function validateExtension(
  rules: Readonly<Record<string, unknown>>,
  parserNames: readonly string[],
): ReadonlySet<string> {
  const ruleNames = Object.keys(rules);
  assertCallableRules(rules, ruleNames);
  return validatedParserNames(new Set(ruleNames), parserNames);
}

function assertCallableRules(
  rules: Readonly<Record<string, unknown>>,
  ruleNames: readonly string[],
): void {
  for (const ruleName of ruleNames) {
    if (!isFunction(rules[ruleName])) {
      throw new EnforceSchemaError(
        `enforce.extend() rule "${ruleName}" must be a function`,
      );
    }
  }
}

function validatedParserNames(
  declaredRules: ReadonlySet<string>,
  parserNames: readonly string[],
): ReadonlySet<string> {
  const parsers = new Set<string>();
  for (const parserName of parserNames) {
    if (!isStringValue(parserName) || !declaredRules.has(parserName)) {
      throw new EnforceSchemaError(
        `enforce.extend() parser "${String(parserName)}" is not a declared rule`,
      );
    }
    if (parsers.has(parserName)) {
      throw new EnforceSchemaError(
        `enforce.extend() parser "${parserName}" is listed more than once`,
      );
    }
    parsers.add(parserName);
  }
  return parsers;
}
