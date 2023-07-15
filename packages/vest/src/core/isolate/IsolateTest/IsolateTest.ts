import { CB, Maybe, seq } from 'vest-utils';
import { IsolateKey, TIsolate, Isolate } from 'vestjs-runtime';

import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { AsyncTest, TestFn } from 'TestTypes';
import { VestIsolateType } from 'VestIsolateType';
import { VestTestInspector } from 'VestTestInspector';

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
  const isolate = Isolate.createWithKey<IsolateTestPayload>(
    VestIsolateType.Test,
    input.key ?? null,
    callback,
    payload
  );

  setIsolateTestValueOf(isolate);

  return isolate as TIsolateTest<F, G>;
}

export function IsolateTestBase() {
  return {
    id: seq(),
    severity: TestSeverity.Error,
    status: TestStatus.UNTESTED,
  };
}

export function setIsolateTestValueOf(test: TIsolateTest) {
  test.valueOf = () => {
    return !VestTestInspector.isFailing(test);
  };
}

export type IsolateTestPayload<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = CommonTestFields<F, G> & {
  id: string;
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
