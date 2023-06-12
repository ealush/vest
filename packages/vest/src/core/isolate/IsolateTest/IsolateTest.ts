import { CB, seq } from 'vest-utils';
import { Isolate, IsolateKey, IsolateMutator } from 'vestjs-runtime';

import { IsolateTestReconciler } from 'IsolateTestReconciler';
import {
  TestAction,
  TestStatus,
  createTestStateMachine,
} from 'IsolateTestStateMachine';
import { TestSeverity } from 'Severity';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { TestFn, AsyncTest, TestResult } from 'TestTypes';
import { VestIsolateType } from 'VestIsolateType';
import { VestTestInspector } from 'VestTestInspector';
import { castIsolateTest } from 'isIsolateTest';
import { shouldUseErrorAsMessage } from 'shouldUseErrorMessage';

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
  message?: string;
  asyncTest?: AsyncTest;
  id = seq();
  severity = TestSeverity.Error;
  type = VestIsolateType.Test;
  private stateMachine = createTestStateMachine();

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

  static create<Callback extends CB = CB>(
    callback: Callback,
    data: IsolateTestInput
  ): IsolateTest {
    return castIsolateTest(super.create(callback, data));
  }

  get status(): TestStatus {
    return this.stateMachine.getState();
  }

  setStatus(status: TestStatus, payload?: any): void {
    this.stateMachine.transition(status, payload);
  }

  run(): TestResult {
    let result: TestResult;
    try {
      result = this.testFn();
    } catch (error) {
      if (shouldUseErrorAsMessage(this.message, error)) {
        this.message = error;
      }
      result = false;
    }

    if (result === false) {
      this.fail();
    }

    return result;
  }

  // State modifiers

  setPending() {
    this.setStatus(TestStatus.PENDING);
  }

  fail(): void {
    this.setStatus(
      VestTestInspector.warns(this) ? TestStatus.WARNING : TestStatus.FAILED
    );
  }

  pass(): void {
    this.setStatus(TestStatus.PASSING);
  }

  warn(): void {
    this.severity = TestSeverity.Warning;
  }

  skip(force?: boolean): void {
    // Without this force flag, the test will be marked as skipped even if it is pending.
    // This means that it will not be counted in "allIncomplete" and its done callbacks
    // will not be called, or will be called prematurely.
    // What this mostly say is that when we have a pending test for one field, and we then
    // start typing in a different field - the pending test will be canceled, which
    // is usually an unwanted behavior.
    // The only scenario in which we DO want to cancel the async test regardless
    // is when we specifically skip a test with `skipWhen`, which is handled by the
    // "force" boolean flag.
    // I am not a fan of this flag, but it gets the job done.
    this.setStatus(TestStatus.SKIPPED, force);
  }

  cancel(): void {
    this.setStatus(TestStatus.CANCELED);
  }

  reset(): void {
    this.stateMachine.transition(TestAction.RESET);
  }

  omit(): void {
    this.setStatus(TestStatus.OMITTED);
  }

  valueOf(): boolean {
    return !VestTestInspector.isFailing(this);
  }
}
