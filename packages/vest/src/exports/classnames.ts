import { isFunction } from 'vest-utils';

import { SuiteSummary, TFieldName, TGroupName } from 'SuiteResultTypes';
import { ParsedVestObject, parse } from 'parser';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames<F extends TFieldName, G extends TGroupName>(
  res: SuiteSummary<F, G>,
  classes: SupportedClasses = {},
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
  [K in keyof ParsedVestObject<TFieldName>]?: string;
};
