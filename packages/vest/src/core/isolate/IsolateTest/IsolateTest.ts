import { Maybe, seq } from 'vest-utils';
import { Isolate, IsolateKey, IsolateMutator } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';
import { createTestStateMachine } from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestFn, AsyncTest } from 'TestTypes';
import { VestIsolateType } from 'VestIsolateType';
import { VestTestInspector } from 'VestTestInspector';

type IsolateTestInput = {
  message?: string;
  groupName?: string;
  fieldName: TFieldName;
  testFn: TestFn;
  key?: IsolateKey;
};

export class IsolateTest<
  F extends TFieldName = TFieldName,
  G extends TGroupName = TGroupName
> extends Isolate {
  children = null;
  fieldName: F;
  testFn: TestFn;
  groupName?: G;
  message?: Maybe<string>;
  asyncTest?: AsyncTest;
  id = seq();
  severity = TestSeverity.Error;
  type = VestIsolateType.Test;
  stateMachine = createTestStateMachine();

  static reconciler = IsolateTestReconciler;

  constructor({
    fieldName,
    testFn,
    message,
    groupName,
    key = null,
  }: IsolateTestInput) {
    super();

    this.fieldName = fieldName as F;
    this.testFn = testFn;

    if (groupName) {
      this.groupName = groupName as G;
    }

    if (message) {
      this.message = message;
    }

    IsolateMutator.setKey(this, key);
  }

  valueOf(): boolean {
    return !VestTestInspector.isFailing(this);
  }
}
