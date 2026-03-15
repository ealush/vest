import { type Maybe } from 'vest-utils';

import { allRules, schemaRulesMap } from './eager/allRules';
import type { EnforceEagerReturn } from './eager/eagerTypes';
import { createRuleCall } from './eager/ruleCallGenerator';
import { extendEager, getRule, getSchemaRule } from './eager/ruleRegistry';

export { extendEager };
export type { EnforceEagerReturn } from './eager/eagerTypes';

const MESSAGE_KEY = 'message';
const THEN_KEY = 'then';
const CATCH_KEY = 'catch';

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
  let pendingPromise: Promise<void> | null = null;

  const setMessage = (msg?: string) => {
    customMessage = msg;
    return proxy;
  };

  const clearMessage = () => setMessage(undefined);

  const ensurePendingPromise = () => {
    if (!pendingPromise) {
      pendingPromise = Promise.resolve();
    }

    return pendingPromise;
  };

  const getReservedProperty = (key: string) => {
    switch (key) {
      case MESSAGE_KEY:
        return setMessage;
      case THEN_KEY:
        return ensurePendingPromise().then.bind(ensurePendingPromise());
      case CATCH_KEY:
        return ensurePendingPromise().catch.bind(ensurePendingPromise());
      default:
        return undefined;
    }
  };

  const proxy: EagerReturn<T> = new Proxy(
    {},
    {
      get(_target: any, key: string) {
        const reservedProperty = getReservedProperty(key);
        if (reservedProperty) {
          return reservedProperty;
        }

        const rule = getRule(key) ?? getSchemaRule(key);
        if (rule) {
          return createRuleCall({
            clearMessage,
            customMessage,
            getPendingPromise: () => pendingPromise,
            rule,
            ruleName: key,
            setPendingPromise: nextPromise => {
              pendingPromise = nextPromise;
            },
            target: proxy,
            value,
          });
        }

        return _target[key];
      },
    },
  );

  proxy.pass = true;

  return proxy;
}
