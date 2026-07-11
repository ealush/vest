import { CB, Maybe } from 'vest-utils';
import { TIsolate, Isolate, IsolateKey } from 'vestjs-runtime';

import { TestSeverity } from '../../../suiteResult/Severity';
import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import {
  IsolateTestStateMachine,
  TestStatus,
} from '../../StateMachines/IsolateTestStateMachine';
import { AsyncTest, TestFn, TestIssue } from '../../test/TestTypes';
import { VestIsolateType } from '../VestIsolateType';

export type TIsolateTest<F extends TFieldName = TFieldName> = TIsolate<
  CommonTestFields<F> & IsolateTestPayload
>;

export function IsolateTest<F extends TFieldName = TFieldName>(
  callback: CB,
  input: CommonTestFields<F>,
  key?: IsolateKey,
): TIsolateTest<F> {
  const payload: IsolateTestPayload = {
    ...IsolateTestBase(),
    fieldName: input.fieldName,
    testFn: input.testFn,
  };

  if (input.message) {
    payload.message = input.message;
  }

  if (input.issue) {
    payload.issue = input.issue;
  }

  const isolate = Isolate.create<IsolateTestPayload>(
    VestIsolateType.Test,
    callback,
    payload,
    key ?? null,
  );

  return isolate as TIsolateTest<F>;
}

export function IsolateTestBase() {
  return {
    severity: TestSeverity.Error,
    testStatus: IsolateTestStateMachine.initial(),
  };
}

export type IsolateTestPayload<F extends TFieldName = TFieldName> =
  CommonTestFields<F> & {
    severity: TestSeverity;
    testStatus: TestStatus;
    asyncTest?: AsyncTest;
  };

type CommonTestFields<F extends TFieldName = TFieldName> = {
  issue?: TestIssue;
  message?: Maybe<string>;
  fieldName: F;
  testFn: TestFn;
};
