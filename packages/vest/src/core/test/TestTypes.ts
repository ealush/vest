import { Maybe } from 'vest-utils';

import { TFieldName } from '../../suiteResult/SuiteResultTypes';

export type TestFnPayload = { signal: AbortSignal };

export type TestFn = (payload: TestFnPayload) => TestResult;
export type AsyncTest = Promise<void>;
export type TestResult = Maybe<AsyncTest | boolean> | void;

export type TestIssue = {
  code: string;
  message: string;
  meta?: Readonly<Record<string, unknown>>;
  path?: ReadonlyArray<string | number>;
};

export type TestMessage = string | TestIssue | undefined;

export type WithFieldName<F extends TFieldName = TFieldName> = {
  fieldName: F;
};
