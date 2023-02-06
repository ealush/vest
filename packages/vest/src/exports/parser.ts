import { hasOwnProperty, invariant, isNullish, isPositive } from 'vest-utils';

import { SuiteSummary, TFieldName } from 'SuiteResultTypes';

// @ts-ignore - Need to understand why Vest is not being recognized
import { suiteSelectors } from 'vest';

export function parse<F extends TFieldName>(
  summary: SuiteSummary<F>
): ParsedVestObject<F> {
  invariant(
    summary && hasOwnProperty(summary, 'valid'),
    "Vest parser: expected argument at position 0 to be Vest's result object."
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
