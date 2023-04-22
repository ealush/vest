import { TFieldName } from 'SuiteResultTypes';

export type TestFn = () => TestResult;
export type AsyncTest = Promise<string | void | false>;
export type TestResult = AsyncTest | boolean | void;

export type WithFieldName<F extends TFieldName = TFieldName> = {
  fieldName: F;
};
