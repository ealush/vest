import { isPositive, defaultTo, hasOwnProperty, invariant } from 'vest-utils';

import { SeverityCount } from 'Severity';
import { SuiteSummary } from 'genTestsSummary';

// eslint-disable-next-line max-lines-per-function
export function parse(res: SuiteSummary): {
  valid: (fieldName?: string) => boolean;
  tested: (fieldName?: string) => boolean;
  invalid: (fieldName?: string) => boolean;
  untested: (fieldName?: string) => boolean;
  warning: (fieldName?: string) => boolean;
} {
  invariant(
    res && hasOwnProperty(res, 'valid'),
    "Vest parser: expected argument at position 0 to be Vest's result object."
  );

  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    invalid: hasErrors,
    tested: isTested,
    untested: isUntested,
    valid: isValid,
    warning: hasWarnings,
  };

  return selectors;

  function isTested(fieldName?: string): boolean {
    if (!fieldName) {
      return isPositive(res.testCount);
    }

    if (hasOwnProperty(testedStorage, fieldName))
      return testedStorage[fieldName];

    testedStorage[fieldName] =
      hasOwnProperty(res.tests, fieldName) &&
      isPositive(res.tests[fieldName].testCount);

    return selectors.tested(fieldName);
  }

  function isUntested(fieldName?: string): boolean {
    return res.testCount === 0 || !selectors.tested(fieldName);
  }

  function isValid(fieldName?: string): boolean {
    return fieldName ? Boolean(res.tests[fieldName]?.valid) : res.valid;
  }

  function hasWarnings(fieldName?: string): boolean {
    return hasFailures(SeverityCount.WARN_COUNT, fieldName);
  }

  function hasErrors(fieldName?: string): boolean {
    return hasFailures(SeverityCount.ERROR_COUNT, fieldName);
  }

  function hasFailures(countKey: SeverityCount, fieldName?: string): boolean {
    const failureCount = defaultTo(
      fieldName ? res.tests[fieldName]?.[countKey] : res[countKey],
      0
    );

    return isPositive(failureCount);
  }
}
