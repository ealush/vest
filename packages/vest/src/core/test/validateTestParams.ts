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

import { TestFn, TestIssue, TestMessage } from './TestTypes';

export type TestParams<F extends TFieldName = TFieldName> = {
  fieldName: F;
  key?: IsolateKey;
  issue?: TestIssue;
  message?: string;
  testFn: TestFn;
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

  const [messageOrIssue, testFn, key] = (
    isFunction(rest[1]) ? rest : [undefined, ...rest]
  ) as [TestMessage, TestFn, IsolateKey | undefined];

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
    ...normalizeMessage(messageOrIssue),
    key,
    testFn,
  });
}

function normalizeMessage(messageOrIssue: TestMessage) {
  if (typeof messageOrIssue === 'object' && messageOrIssue !== null) {
    return { issue: messageOrIssue, message: messageOrIssue.message };
  }
  return { message: messageOrIssue };
}
