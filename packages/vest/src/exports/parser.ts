import { hasOwnProperty, invariant, isPositive } from 'vest-utils';

import { SuiteSummary } from 'SuiteSummaryTypes';
import { suiteSelectors } from 'vest';

// eslint-disable-next-line max-statements
export function parse(summary: SuiteSummary): ParsedVestObject {
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
  function isTested(fieldName?: string): boolean {
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

  function isUntested(fieldName?: string): boolean {
    return !(isPositive(summary.testCount) && selectors.tested(fieldName));
  }
}

interface ParsedVestObject {
  valid(fieldName?: string): boolean;
  tested(fieldName?: string): boolean;
  invalid(fieldName?: string): boolean;
  untested(fieldName?: string): boolean;
  warning(fieldName?: string): boolean;
}
