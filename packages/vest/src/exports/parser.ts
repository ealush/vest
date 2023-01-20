import { hasOwnProperty, invariant, isPositive } from 'vest-utils';

import { SuiteSummary, TFieldName } from 'SuiteResultTypes';
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
    if (!fieldName) {
      return isPositive(summary.testCount);
    }

    if (hasOwnProperty(testedStorage, fieldName))
      return testedStorage[fieldName];

    testedStorage[fieldName] =
      hasOwnProperty(summary.tests, fieldName) &&
      isPositive(summary.tests[fieldName].testCount);

    return selectors.tested(fieldName);
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
