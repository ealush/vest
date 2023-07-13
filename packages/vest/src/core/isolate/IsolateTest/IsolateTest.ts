import { CB, seq } from 'vest-utils';
import { IsolateKey, IsolateMutator, createIsolate } from 'vestjs-runtime';

import { TestStatus } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestFn } from 'TestTypes';
import { VestIsolateType } from 'VestIsolateType';

export type TIsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = IsolateTestInput<F, G> & {
  id: string;
  severity: TestSeverity;
  status: TestStatus;
};

export function IsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
>(callback: CB, input: IsolateTestInput): TIsolateTest<F, G> {
  const payload: TIsolateTest = {
    fieldName: input.fieldName,
    id: seq(),
    severity: TestSeverity.Error,
    status: TestStatus.PENDING,
    testFn: input.testFn,
  };

  if (input.groupName) {
    payload.groupName = input.groupName;
  }

  if (input.message) {
    payload.message = input.message;
  }
  const isolate = createIsolate<TIsolateTest<F, G>>(
    VestIsolateType.Test,
    callback
  );

  IsolateMutator.setKey(isolate, input.key ?? null);

  return isolate;
}
// valueOf(): boolean {
//   return !VestTestInspector.isFailing(this);
// }

type IsolateTestPayload<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = {
  message?: string;
  groupName?: G;
  fieldName: F;
  testFn: TestFn;
};

type IsolateTestInput<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> = IsolateTestPayload<F, G> & {
  key?: IsolateKey;
};
