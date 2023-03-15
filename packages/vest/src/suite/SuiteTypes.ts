import { CB } from 'vest-utils';

import { SuiteResult, SuiteRunResult, TFieldName } from 'SuiteResultTypes';

export type Suite<T extends CB, F extends TFieldName> = ((
  ...args: Parameters<T>
) => SuiteRunResult<F>) &
  SuiteMethods<F>;

export type SuiteMethods<F extends TFieldName> = {
  get: () => SuiteResult<F>;
  reset: () => void;
  remove: (fieldName: F) => void;
  resetField: (fieldName: F) => void;
};
