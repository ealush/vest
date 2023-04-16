import { CB } from 'vest-utils';

import { SuiteRunResult, TFieldName, TGroupName } from 'SuiteResultTypes';
import { createSuite } from 'createSuite';

export function staticSuite<
  T extends CB,
  F extends TFieldName = string,
  G extends TGroupName = string
>(suiteCallback: T): (...args: Parameters<T>) => SuiteRunResult<F, G> {
  return (...args) => createSuite<T, F, G>(suiteCallback)(...args);
}
