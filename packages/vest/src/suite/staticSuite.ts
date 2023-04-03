import { CB } from 'vest-utils';

import { SuiteRunResult, TFieldName } from 'SuiteResultTypes';
import { createSuite } from 'createSuite';

export function staticSuite<T extends CB, F extends TFieldName>(
  suiteCallback: T
): (...args: Parameters<T>) => SuiteRunResult<F> {
  return (...args) => createSuite(suiteCallback)(...args);
}
