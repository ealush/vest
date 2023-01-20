/**
 * DONE is here and not in its own module to prevent circular dependency issues.
 */

import { isFunction, numberEquals } from 'vest-utils';

import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';

export function shouldSkipDoneRegistration(
  callback: (res: SuiteResult<TFieldName>) => void,

  fieldName: TFieldName | undefined,
  output: SuiteRunResult<TFieldName>
): boolean {
  // If we do not have any test runs for the current field
  return !!(
    !isFunction(callback) ||
    (fieldName && numberEquals(output.tests[fieldName]?.testCount, 0))
  );
}
