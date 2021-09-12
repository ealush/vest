import { greaterThan } from 'greaterThan';
import hasOwnProperty from 'hasOwnProperty';

import type { IVestResult } from 'produce';
import type { TDraftResult } from 'produceDraft';

export function parse(res: IVestResult | TDraftResult): {
  valid: (fieldName?: string) => boolean;
  tested: (fieldName?: string) => boolean;
  invalid: (fieldName?: string) => boolean;
  untested: (fieldName?: string) => boolean;
  warning: (fieldName?: string) => boolean;
} {
  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    invalid: res.hasErrors,
    tested: (fieldName?: string): boolean => {
      if (!fieldName) {
        return greaterThan(res.testCount, 0);
      }

      if (hasOwnProperty(testedStorage, fieldName))
        return testedStorage[fieldName];

      testedStorage[fieldName] =
        hasOwnProperty(res.tests, fieldName) &&
        greaterThan(res.tests[fieldName].testCount, 0);

      return selectors.tested(fieldName);
    },
    untested: (fieldName?: string): boolean =>
      res.testCount === 0 || !selectors.tested(fieldName),
    valid: res.isValid,
    warning: res.hasWarnings,
  };

  return selectors;
}
