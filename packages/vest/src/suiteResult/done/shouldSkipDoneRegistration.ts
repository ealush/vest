/**
 * DONE is here and not in its own module to prevent circular dependency issues.
 */

import { isFunction, numberEquals } from 'vest-utils';

import {
  SuiteResult,
  SuiteRunResult,
  TFieldName,
  TGroupName,
} from 'SuiteResultTypes';

export function shouldSkipDoneRegistration<
  F extends TFieldName,
  G extends TGroupName
>(
  callback: (res: SuiteResult<F, G>) => void,

  fieldName: F | undefined,
  output: SuiteRunResult<F, G>
): boolean {
  // If we do not have any test runs for the current field
  return !!(
    !isFunction(callback) ||
    (fieldName && numberEquals(output.tests[fieldName]?.testCount, 0))
  );
}
