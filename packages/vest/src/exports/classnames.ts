import { isFunction } from 'vest-utils';

import { SuiteSummary } from 'genTestsSummary';
import { parse } from 'parser';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames(
  res: SuiteSummary,
  classes: SupportedClasses = {}
): (fieldName: string) => string {
  const selectors = parse(res);

  return (key: string): string => {
    const classesArray: string[] = [];

    for (const selector in classes) {
      const sel = selector as keyof SupportedClasses;
      if (isFunction(selectors[sel]) && selectors[sel](key)) {
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
