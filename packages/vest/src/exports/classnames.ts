import { greaterThan } from 'greaterThan';
import hasOwnProperty from 'hasOwnProperty';
import isFunction from 'isFunction';

import type { IVestResult } from 'produce';
import type { TDraftResult } from 'produceDraft';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classNames(
  res: IVestResult | TDraftResult,
  classes: TSupportedClasses = {}
): (fieldName: string) => string {
  if (!res || !isFunction(res.hasErrors)) {
    throw new Error(
      "[vest/classNames]: Expected first argument to be Vest's result object."
    );
  }

  const testedStorage: Record<string, boolean> = {};

  const selectors = {
    invalid: (key: string): boolean =>
      selectors.tested(key) && res.hasErrors(key),
    tested: (key: string): boolean => {
      if (hasOwnProperty(testedStorage, key)) return testedStorage[key];

      testedStorage[key] =
        hasOwnProperty(res.tests, key) &&
        greaterThan(res.tests[key].testCount, 0);

      return selectors.tested(key);
    },
    untested: (key: string): boolean => !selectors.tested(key),
    valid: (key: string): boolean =>
      selectors.tested(key) && !res.hasWarnings(key) && !res.hasErrors(key),
    warning: (key: string): boolean =>
      selectors.tested(key) && res.hasWarnings(key),
  };

  return (key: string): string => {
    const classesArray: string[] = [];

    for (const selector in classes) {
      const sel = selector as keyof TSupportedClasses;
      if (isFunction(selectors[sel]) && selectors[sel](key)) {
        classesArray.push(classes[sel] as string);
      }
    }

    return classesArray.join(' ');
  };
}

type TSupportedClasses = {
  valid?: string;
  tested?: string;
  invalid?: string;
  warning?: string;
  untested?: string;
};
