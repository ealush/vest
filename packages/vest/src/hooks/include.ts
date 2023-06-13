import {
  isStringValue,
  defaultTo,
  hasOwnProperty,
  invariant,
  optionalFunctionValue,
} from 'vest-utils';

import { useExclusion, useInclusion } from 'SuiteContext';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TDraftCondition } from 'getTypedMethods';
import { useCreateSuiteResult } from 'suiteResult';

/**
 * Conditionally includes a field for testing, based on specified criteria.
 *
 * @param {string} fieldName - The name of the field to include for testing.
 *
 * @example
 * include('confirm').when('password');
 * // Includes the "confirm" field for testing when the "password" field is included
 *
 * include('confirm').when(someValue);
 * // Includes the "confirm" field for testing when the value of `someValue` is true
 *
 * include('confirm').when(() => someValue);
 * // Includes the "confirm" field for testing when the callback function returns true
 *
 * include('username').when(result => result.hasErrors('username'));
 * // Includes the "username" field for testing when there are errors associated with it in the current suite result
 */
// @vx-allow use-use
export function include<F extends TFieldName, G extends TGroupName>(
  fieldName: F
): {
  when: (condition: F | TFieldName | TDraftCondition<F, G>) => void;
} {
  const inclusion = useInclusion();
  const exclusion = useExclusion();

  invariant(isStringValue(fieldName));

  inclusion[fieldName] = defaultTo(exclusion.tests[fieldName], true);

  return { when };

  /**
   * Specifies the inclusion criteria for the field in `include` function.
   */
  function when(condition: F | TFieldName | TDraftCondition<F, G>): void {
    const inclusion = useInclusion();
    const exclusion = useExclusion();

    // This callback will run as part of the "isExcluded" series of checks
    inclusion[fieldName] = (): boolean => {
      if (hasOwnProperty(exclusion.tests, fieldName)) {
        // I suspect this code is technically unreachable because
        // if there are any skip/only rules applied to the current
        // field, the "isExcluded" function will have already bailed
        /* istanbul ignore next */
        return defaultTo(exclusion.tests[fieldName], true);
      }

      if (isStringValue(condition)) {
        return Boolean(exclusion.tests[condition]);
      }

      return optionalFunctionValue(
        condition,
        optionalFunctionValue(useCreateSuiteResult)
      );
    };
  }
}
