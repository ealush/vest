import isFunction from 'isFunction';
import throwError from 'throwError';

import { parse } from 'parser';
import type { IVestResult } from 'produce';
import type { TDraftResult } from 'produceDraft';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames(
  res: IVestResult | TDraftResult,
  classes: TSupportedClasses = {}
): (fieldName: string) => string {
  if (!res || !isFunction(res.hasErrors)) {
    throwError(
      "classnames: Expected first argument to be Vest's result object."
    );
  }

  const selectors = parse(res);

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
