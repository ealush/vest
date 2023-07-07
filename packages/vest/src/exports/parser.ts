import { hasOwnProperty, invariant, isNullish, isPositive } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { SuiteSummary, TFieldName, TGroupName } from 'SuiteResultTypes';
import { suiteSelectors } from 'vest';

export function parse<F extends TFieldName, G extends TGroupName>(
  summary: SuiteSummary<F, G>
): ParsedVestObject<F> {
  invariant(
    summary && hasOwnProperty(summary, 'valid'),
    ErrorStrings.PARSER_EXPECT_RESULT_OBJECT
  );

  const sel = suiteSelectors(summary);

  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    invalid: sel.hasErrors,
    tested: isTested,
    untested: isUntested,
    valid: sel.isValid,
    warning: sel.hasWarnings,
  };

  return selectors;

  // Booleans
  function isTested(fieldName?: F): boolean {
    if (isNullish(fieldName)) {
      return isPositive(summary.testCount);
    }

    if (hasOwnProperty(testedStorage, fieldName)) {
      return testedStorage[fieldName];
    }

    addFieldToTestedStorage(fieldName);

    return selectors.tested(fieldName);
  }

  function addFieldToTestedStorage(fieldName: F): void {
    testedStorage[fieldName] =
      hasOwnProperty(summary.tests, fieldName) &&
      isPositive(summary.tests[fieldName].testCount);
  }

  function isUntested(fieldName?: F): boolean {
    return !(isPositive(summary.testCount) && selectors.tested(fieldName));
  }
}

interface ParsedVestObject<F extends TFieldName> {
  valid(fieldName?: F): boolean;
  tested(fieldName?: F): boolean;
  invalid(fieldName?: F): boolean;
  untested(fieldName?: F): boolean;
  warning(fieldName?: F): boolean;
}
