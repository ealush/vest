import { Maybe } from 'vest-utils';

import { TFieldName } from 'SuiteResultTypes';

export type TestFn = () => TestResult;
export type AsyncTest = Promise<Maybe<string | false>>;
export type TestResult = Maybe<AsyncTest | boolean>;

export type WithFieldName<F extends TFieldName = TFieldName> = {
  fieldName: F;
};
