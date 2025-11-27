import {
  isFunction,
  isStringValue,
  makeBrand,
  makeResult,
  Result,
  text,
} from 'vest-utils';
import { IsolateKey } from 'vestjs-runtime';

import { ErrorStrings } from '../../errors/ErrorStrings';
import { TFieldName } from '../../suiteResult/SuiteResultTypes';

import { TestFn } from './TestTypes';

export type TestParams<F extends TFieldName = TFieldName> = {
  fieldName: F;
  message?: string;
  testFn: TestFn;
  key?: IsolateKey;
};

export function validateTestParams(
  fieldName: string,
  ...rest: any[]
): Result<TestParams, string> {
  if (!isStringValue(fieldName)) {
    return makeResult.Err(
      text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
        fn_name: 'test',
        param: 'fieldName',
        expected: 'string',
      }),
    );
  }

  const [message, testFn, key] = (
    isFunction(rest[1]) ? rest : [undefined, ...rest]
  ) as [string | undefined, TestFn, IsolateKey | undefined];

  if (!isFunction(testFn)) {
    return makeResult.Err(
      text(ErrorStrings.INVALID_PARAM_PASSED_TO_FUNCTION, {
        fn_name: 'test',
        param: 'callback',
        expected: 'function',
      }),
    );
  }

  return makeResult.Ok({
    fieldName: makeBrand<TFieldName>(fieldName),
    message,
    testFn,
    key,
  });
}
