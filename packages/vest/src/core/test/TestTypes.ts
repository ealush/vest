import { Maybe } from 'vest-utils';

import { TFieldName } from 'SuiteResultTypes';

type TestFnPayload = { signal: AbortSignal };

export type TestFn = (payload: TestFnPayload) => TestResult;
export type AsyncTest = Promise<void>;
export type TestResult = Maybe<AsyncTest | boolean> | void;

export type WithFieldName<F extends TFieldName = TFieldName> = {
  fieldName: F;
};
