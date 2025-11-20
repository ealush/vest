import type { Maybe } from 'vest-utils';

import { allRules, schemaRulesMap } from './eager/allRules';
import type { EnforceEagerReturn } from './eager/eagerTypes';
import { createRuleCall } from './eager/ruleCallGenerator';
import { extendEager, getRule, getSchemaRule } from './eager/ruleRegistry';

export { extendEager };
export type { EnforceEagerReturn, TArraySchemaRules } from './eager/eagerTypes';

const MESSAGE_KEY = 'message';

type EagerReturn<T> = EnforceEagerReturn<
  T,
  typeof allRules,
  typeof schemaRulesMap
>;

/**
 * Eager (imperative) validation API - validates a value immediately with chainable assertions.
 * Each chained rule executes synchronously and the chain breaks on the first failure.
 *
 * @template T - The type of value being validated
 * @param value - The value to validate
 * @returns A proxy object with chainable validation methods and a `pass` property
 *
 * @example
 * ```typescript
 * // Simple validation
 * enforce('hello').isString(); // passes
 *
 * // Chained validation
 * enforce(25)
 *   .isNumber()
 *   .greaterThan(18)
 *   .lessThan(100);
 *
 * // Custom error messages
 * enforce('')
 *   .message('Field is required')
 *   .isNotEmpty();
 *
 * // Type narrowing
 * enforce(value)
 *   .isString()
 *   .longerThan(5);
 * // value is now known to be a string
 *
 * // Schema validation
 * enforce({ name: 'John', age: 30 })
 *   .shape({
 *     name: enforce.isString(),
 *     age: enforce.isNumber()
 *   });
 *
 * // Check pass status without throwing
 * const result = enforce(value).isString();
 * if (result.pass) {
 *   // validation passed
 * }
 * ```
 */
export function enforceEager<T>(value: T): EagerReturn<T> {
  let customMessage: Maybe<string> = undefined;

  const setMessage = (msg?: string) => {
    customMessage = msg;
    return proxy;
  };

  const clearMessage = () => setMessage(undefined);

  const proxy: EagerReturn<T> = new Proxy(
    {},
    {
      get(_target: any, key: string) {
        if (key === MESSAGE_KEY) return setMessage;

        const rule = getRule(key) ?? getSchemaRule(key);
        if (rule) {
          return createRuleCall({
            clearMessage,
            customMessage,
            rule,
            ruleName: key,
            target: proxy,
            value,
          });
        }

        return _target[key];
      },
    },
  );

  return proxy;
}
