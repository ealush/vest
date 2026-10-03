import {
  hasOwnProperty,
  invariant,
  isNullish,
  isPositive,
  makeBrand,
} from 'vest-utils';

import { ErrorStrings } from '../errors/ErrorStrings';
import {
  SuiteResult,
  SuiteSummary,
  TFieldName,
  TGroupName,
  TSchema,
} from '../suiteResult/SuiteResultTypes';
import { suiteSelectors } from '../vest';

// eslint-disable-next-line max-lines-per-function
export function parse<
  F extends TFieldName,
  G extends TGroupName,
  S extends TSchema,
>(summary: SuiteSummary<F, G> | SuiteResult<F, G, S>): ParsedVestObject<F> {
  invariant(
    summary && hasOwnProperty(summary, 'valid'),
    ErrorStrings.PARSER_EXPECT_RESULT_OBJECT,
  );

  const sel = suiteSelectors(summary);

  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    invalid: sel.hasErrors,
    pending: sel.isPending,
    success: sel.hasSuccesses,
    tested: isTested,
    untested: isUntested,
    valid: sel.isValid,
    warning: sel.hasWarnings,
  };

  return selectors;

  // Booleans
  function isTested(fieldName?: F | string): boolean {
    if (isNullish(fieldName)) {
      return isPositive(summary.testCount);
    }

    const safeFieldName = makeBrand<TFieldName>(fieldName);

    if (hasOwnProperty(testedStorage, safeFieldName)) {
      return testedStorage[safeFieldName];
    }

    addFieldToTestedStorage(safeFieldName);

    return selectors.tested(safeFieldName as F);
  }

  function addFieldToTestedStorage(fieldName: TFieldName): void {
    testedStorage[fieldName] =
      hasOwnProperty(summary.tests, fieldName) &&
      isPositive(summary.tests[fieldName].testCount);
  }

  function isUntested(fieldName?: F | string): boolean {
    const safeFieldName = fieldName
      ? makeBrand<TFieldName>(fieldName)
      : undefined;

    return !(
      isPositive(summary.testCount) &&
      selectors.tested(safeFieldName as F | undefined)
    );
  }
}

export type ParsedVestObject<F extends TFieldName> = {
  valid(fieldName?: F | string): boolean;
  tested(fieldName?: F | string): boolean;
  invalid(fieldName?: F | string): boolean;
  untested(fieldName?: F | string): boolean;
  warning(fieldName?: F | string): boolean;
  pending(fieldName?: F | string): boolean;
  success(fieldName?: F | string): boolean;
};
