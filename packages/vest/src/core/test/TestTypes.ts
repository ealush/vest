import { Maybe } from 'vest-utils';

import { TFieldName } from 'SuiteResultTypes';

export type TestFn = (abortSignal?: AbortSignal) => TestResult;
export type AsyncTest = Promise<void>;
export type TestResult = Maybe<AsyncTest | boolean>;

export type WithFieldName<F extends TFieldName = TFieldName> = {
  fieldName: F;
};
