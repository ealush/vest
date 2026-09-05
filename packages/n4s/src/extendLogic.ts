import { extendEager } from './eager';
import { ctx } from './enforceContext';
import { addToChain, registerLazyRule } from './rules/genRuleChain';
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
  parserNames: ReadonlySet<string> = new Set(),
) {
  extendEager(rules);

  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName];
    const callableRule = rule as unknown as (
      value: unknown,
      ...args: unknown[]
    ) => unknown;
    const ruleWrapper = (value: unknown, ...args: unknown[]) => {
      const res = ctx.run({ value }, () => callableRule(value, ...args));
      return RuleRunReturn.create(
        res as boolean | RuleRunReturn<unknown>,
        value,
      );
    };

    const mapsValue = parserNames.has(ruleName);
    enforce[ruleName] = (...args: unknown[]) =>
      addToChain(
        {},
        (value: unknown) => ruleWrapper(value, ...args),
        mapsValue,
      );

    registerLazyRule(
      ruleName,
      (...args: unknown[]) =>
        (value: unknown) =>
          ruleWrapper(value, ...args),
      mapsValue,
    );
  });
}
