import { CB, Maybe, seq } from 'vest-utils';
import {
  IsolateKey,
  IsolateMutator,
  TIsolate,
  createIsolate,
} from 'vestjs-runtime';

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
    fieldName: input.fieldName,
    id: seq(),
    severity: TestSeverity.Error,
    status: TestStatus.UNTESTED,
    testFn: input.testFn,
  };

  if (input.groupName) {
    payload.groupName = input.groupName;
  }

  if (input.message) {
    payload.message = input.message;
  }
  const isolate = createIsolate<IsolateTestPayload>(
    VestIsolateType.Test,
    callback,
    payload
  );

  const x = IsolateMutator.setKey(isolate, input.key ?? null) as TIsolateTest<
    F,
    G
  >;

  return x;
}
// valueOf(): boolean {
//   return !VestTestInspector.isFailing(this);
// }

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
