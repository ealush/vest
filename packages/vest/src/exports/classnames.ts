import { isFunction } from 'vest-utils';

import { SuiteSummary, TFieldName } from 'SuiteResultTypes';
import { parse } from 'parser';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames<F extends TFieldName>(
  res: SuiteSummary<F>,
  classes: SupportedClasses = {}
): (fieldName: F) => string {
  const selectors = parse(res);

  return function cn(fieldName: F): string {
    const classesArray: string[] = [];

    for (const selector in classes) {
      const sel = selector as keyof SupportedClasses;
      if (isFunction(selectors[sel]) && selectors[sel](fieldName)) {
        classesArray.push(classes[sel] as string);
      }
    }

    return classesArray.join(' ');
  };
}

type SupportedClasses = {
  valid?: string;
  tested?: string;
  invalid?: string;
  warning?: string;
  untested?: string;
};
