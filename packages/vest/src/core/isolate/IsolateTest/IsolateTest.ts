import { CB, invariant, isPromise, seq } from 'vest-utils';

import { IsolateTestReconciler } from 'IsolateTestReconciler';
import {
  TestAction,
  TestStatus,
  createTestStateMachine,
} from 'IsolateTestStateMachine';
import { TFieldName } from 'SuiteResultTypes';
import { TestFn, AsyncTest, TestResult } from 'TestTypes';
import { Isolate, IsolateKey } from 'isolate';
import { shouldUseErrorAsMessage } from 'shouldUseErrorMessage';

export type IsolateTestInput = {
  message?: string;
  groupName?: string;
  fieldName: TFieldName;
  testFn: TestFn;
  key?: IsolateKey;
};

export class IsolateTest extends Isolate {
  children = null;
  fieldName: TFieldName;
  testFn: TestFn;
  groupName?: string;
  message?: string;
  asyncTest?: AsyncTest;
  id = seq();
  severity = TestSeverity.Error;
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

    this.fieldName = fieldName;
    this.testFn = testFn;

    if (groupName) {
      this.groupName = groupName;
    }

    if (message) {
      this.message = message;
    }

    this.setKey(key);
  }

  static factory<Callback extends CB = CB>(
    callback: Callback,
    data: IsolateTestInput
  ): IsolateTest {
    return super.create(callback, data) as IsolateTest;
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

  // Selectors

  warns(): boolean {
    return this.severity === TestSeverity.Warning;
  }

  isPending(): boolean {
    return this.statusEquals(TestStatus.PENDING);
  }

  isOmitted(): boolean {
    return this.statusEquals(TestStatus.OMITTED);
  }

  isUntested(): boolean {
    return this.statusEquals(TestStatus.UNTESTED);
  }

  isFailing(): boolean {
    return this.statusEquals(TestStatus.FAILED);
  }

  isCanceled(): boolean {
    return this.statusEquals(TestStatus.CANCELED);
  }

  isSkipped(): boolean {
    return this.statusEquals(TestStatus.SKIPPED);
  }

  isPassing(): boolean {
    return this.statusEquals(TestStatus.PASSING);
  }

  isWarning(): boolean {
    return this.statusEquals(TestStatus.WARNING);
  }

  hasFailures(): boolean {
    return this.isFailing() || this.isWarning();
  }

  isNonActionable(): boolean {
    return this.isSkipped() || this.isOmitted() || this.isCanceled();
  }

  isTested(): boolean {
    return this.hasFailures() || this.isPassing();
  }

  awaitsResolution(): boolean {
    // Is the test in a state where it can still be run, or complete running
    // and its final status is indeterminate?
    return this.isSkipped() || this.isUntested() || this.isPending();
  }

  statusEquals(status: TestStatus): boolean {
    return this.status === status;
  }

  // State modifiers

  setPending() {
    this.setStatus(TestStatus.PENDING);
  }

  fail(): void {
    this.setStatus(this.warns() ? TestStatus.WARNING : TestStatus.FAILED);
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
    return !this.isFailing();
  }

  isAsyncTest(): boolean {
    return isPromise(this.asyncTest);
  }

  static is(value: any): value is IsolateTest {
    return value instanceof IsolateTest;
  }

  static isX(value: any): asserts value is IsolateTest {
    invariant(this.is(value));
  }
}

enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
}
