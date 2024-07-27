import type { CB, Maybe } from 'vest-utils';
import { TIsolate, Isolate, IsolateKey } from 'vestjs-runtime';

import {
  IsolateTestStateMachine,
  TestStatus,
} from '@/core/StateMachines/IsolateTestStateMachine';
import { VestIsolateType } from '@/core/isolate/VestIsolateType';
import type { AsyncTest, TestFn } from '@/core/test/TestTypes';
import { TestSeverity } from '@/suiteResult/Severity';
import type { TFieldName, TGroupName } from '@/suiteResult/SuiteResultTypes';

export type TIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
> = TIsolate<CommonTestFields<F, G> & IsolateTestPayload>;

export function IsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
>(
  callback: CB,
  input: CommonTestFields<F, G>,
  key?: IsolateKey,
): TIsolateTest<F, G> {
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
    key ?? null,
  );

  return isolate as TIsolateTest<F, G>;
}

export function IsolateTestBase() {
  return {
    severity: TestSeverity.Error,
    status: IsolateTestStateMachine.initial(),
  };
}

export type IsolateTestPayload<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
> = CommonTestFields<F, G> & {
  severity: TestSeverity;
  status: TestStatus;
  asyncTest?: AsyncTest;
};

type CommonTestFields<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName,
> = {
  message?: Maybe<string>;
  groupName?: G;
  fieldName: F;
  testFn: TestFn;
};
