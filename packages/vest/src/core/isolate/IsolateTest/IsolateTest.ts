import { CB, Maybe } from 'vest-utils';
import { IsolateKey, TIsolate, Isolate } from 'vestjs-runtime';

import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { AsyncTest, TestFn } from 'TestTypes';
import { VestIsolateType } from 'VestIsolateType';

export type TIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = TIsolate & IsolateTestInput<F, G> & IsolateTestPayload;

export function IsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(callback: CB, input: IsolateTestInput): TIsolateTest<F, G> {
  const payload: IsolateTestPayload = {
    ...IsolateTestBase(),
    fieldName: input.fieldName,
    testFn: input.testFn,
  };

  if (input.groupName) {
    payload.groupName = input.groupName;
  }

  if (input.message) {
    payload.message = input.message;
  }
  const isolate = Isolate.create<IsolateTestPayload>(
    VestIsolateType.Test,
    callback,
    payload,
    input.key ?? null
  );

  return isolate as TIsolateTest<F, G>;
}

export function IsolateTestBase() {
  return {
    severity: TestSeverity.Error,
    status: TestStatus.UNTESTED,
  };
}

export type IsolateTestPayload<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = CommonTestFields<F, G> & {
  severity: TestSeverity;
  status: TestStatus;
  asyncTest?: AsyncTest;
};

type CommonTestFields<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = {
  message?: Maybe<string>;
  groupName?: G;
  fieldName: F;
  testFn: TestFn;
};

type IsolateTestInput<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = CommonTestFields<F, G> & {
  key?: IsolateKey;
};
