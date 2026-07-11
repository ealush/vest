import { extendEager } from './eager';
import { ctx } from './enforceContext';
import { addToChain, registerLazyRule } from './rules/genRuleChain';
import { RuleRunReturn } from './utils/RuleRunReturn';

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
export function extendEnforce(
  enforce: any,
  rules: Record<string, (...args: any[]) => any>,
) {
  extendEager(rules);

  Object.keys(rules).forEach(ruleName => {
    const rule = rules[ruleName];
    const ruleWrapper = (value: any, ...args: any[]) => {
      const res = ctx.run({ value }, () => rule(value, ...args));
      return RuleRunReturn.create(res, value);
    };

    enforce[ruleName] = (...args: any[]) =>
      addToChain({}, (value: any) => ruleWrapper(value, ...args), {
        args,
        rule: ruleName,
      });

    registerLazyRule(
      ruleName,
      (...args: any[]) =>
        (value: any) =>
          ruleWrapper(value, ...args),
    );
  });
}
