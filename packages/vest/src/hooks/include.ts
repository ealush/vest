import { isStringValue, invariant, dynamicValue } from 'vest-utils';

import { useInclusion } from '../core/context/SuiteContext';
import { TIsolateTest } from '../core/isolate/IsolateTest/IsolateTest';
import { ErrorStrings } from '../errors/ErrorStrings';
import { TDraftCondition } from '../suite/getTypedMethods';
import { TFieldName, TGroupName } from '../suiteResult/SuiteResultTypes';
import { useCreateSuiteResult } from '../suiteResult/suiteResult';

import { useHasOnliedTests } from './focused/useHasOnliedTests';

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
  fieldName: F,
): {
  when: (condition: F | TFieldName | TDraftCondition<F, G>) => void;
} {
  invariant(isStringValue(fieldName));
  const inclusion = useInclusion();

  inclusion[fieldName] = true;

  return { when };

  /**
   * Specifies the inclusion criteria for the field in `include` function.
   */
  function when(condition: F | TFieldName | TDraftCondition<F, G>): void {
    invariant(condition !== fieldName, ErrorStrings.INCLUDE_SELF);

    const inclusion = useInclusion();

    // This callback will run as part of the "isExcluded" series of checks
    inclusion[fieldName] = function isIncluded(
      currentNode: TIsolateTest,
    ): boolean {
      if (isStringValue(condition)) {
        return useHasOnliedTests(currentNode, condition);
      }

      return dynamicValue(condition, () => useCreateSuiteResult(undefined, undefined));
    };
  }
}
