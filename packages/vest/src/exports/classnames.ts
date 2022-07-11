import isFunction from 'isFunction';
import { parseSuite } from 'vest';

import { SuiteSummary } from 'SuiteSummaryTypes';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames(
  res: SuiteSummary,
  classes: AllowdSelectors = {}
): (fieldName: string) => string {
  const selectors = parseSuite(res);

  return (key: string): string => {
    const classesArray: string[] = [];

    for (const selector in classes) {
      const sel = selector as keyof AllowdSelectors;
      if (isFunction(selectors[sel]) && selectors[sel](key) === true) {
        classesArray.push(classes[sel] as string);
      }
    }

    return classesArray.join(' ');
  };
}

type AllowdSelectors = {
  valid?: string;
  tested?: string;
  invalid?: string;
  warning?: string;
  untested?: string;
};
