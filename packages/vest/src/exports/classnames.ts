import { isFunction, makeBrand } from 'vest-utils';

import {
  SuiteResult,
  TFieldName,
  TGroupName,
} from '../suiteResult/SuiteResultTypes';

import { ParsedVestObject, parse } from './parser';

/**
 * Creates a function that returns class names that match the validation result
 */
export default function classnames<F extends TFieldName, G extends TGroupName>(
  res: SuiteResult<F, G>,
  classes: SupportedClasses = {},
): (fieldName: string) => string {
  const selectors = parse(res);

  return function cn(fieldName: string): string {
    const safeFieldName = makeBrand<TFieldName>(fieldName);
    const classesArray: string[] = [];

    for (const selector of Object.keys(classes) as Array<
      keyof ParsedVestObject<TFieldName>
    >) {
      const sel = selector as keyof ParsedVestObject<TFieldName>;
      const selectorFn = selectors[sel];
      const className = classes[sel];

      if (isFunction(selectorFn) && className && selectorFn?.(safeFieldName)) {
        classesArray.push(className);
      }
    }

    return classesArray.join(' ');
  };
}

type SupportedClasses = Partial<
  Record<keyof ParsedVestObject<TFieldName>, string>
>;
