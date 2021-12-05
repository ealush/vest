import genId from 'genId';

import shouldUseErrorAsMessage from 'shouldUseErrorAsMessage';
import { useRefreshTestObjects } from 'stateHooks';

enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
}

export default class VestTest {
  fieldName: string;
  testFn: TTestFn;
  asyncTest?: TAsyncTest;
  groupName?: string;
  message?: string;
  key?: null | string = null;

  id = genId();
  severity = TestSeverity.Error;
  status: KStatus = STATUS_UNTESTED;

  constructor(
    fieldName: string,
    testFn: TTestFn,
    {
      message,
      groupName,
      key,
    }: { message?: string; groupName?: string; key?: string } = {}
  ) {
    this.fieldName = fieldName;
    this.testFn = testFn;

    if (groupName) {
      this.groupName = groupName;
    }

    if (message) {
      this.message = message;
    }

    if (key) {
      this.key = key;
    }
  }

  run(): TTestResult {
    let result: TTestResult;
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

  setStatus(status: KStatus): void {
    if (this.isFinalStatus() && status !== STATUS_OMITTED) {
      return;
    }

    this.status = status;
  }

  warns(): boolean {
    return this.severity === TestSeverity.Warning;
  }

  setPending() {
    this.setStatus(STATUS_PENDING);
  }

  fail(): void {
    this.setStatus(this.warns() ? STATUS_WARNING : STATUS_FAILED);
  }

  done(): void {
    if (this.isFinalStatus()) {
      return;
    }
    this.setStatus(STATUS_PASSING);
  }

  warn(): void {
    this.severity = TestSeverity.Warning;
  }

  isFinalStatus(): boolean {
    return this.hasFailures() || this.isCanceled() || this.isPassing();
  }

  skip(force?: boolean): void {
    if (this.isPending() && !force) {
      // Without this condition, the test will be marked as skipped even if it is pending.
      // This means that it will not be counted in "allIncomplete" and its done callbacks
      // will not be called, or will be called prematurely.
      // What this mostly say is that when we have a pending test for one field, and we then
      // start typing in a different field - the pending test will be canceled, which
      // is usually an unwanted behavior.
      // The only scenario in which we DO want to cancel the async test regardless
      // is when we specifically skip a test with `skipWhen`, which is handled by the
      // "force" boolean flag.
      // I am not a fan of this flag, but it gets the job done.
      return;
    }
    this.setStatus(STATUS_SKIPPED);
  }

  cancel(): void {
    this.setStatus(STATUS_CANCELED);
    useRefreshTestObjects();
  }

  omit(): void {
    this.setStatus(STATUS_OMITTED);
  }

  valueOf(): boolean {
    return !this.isFailing();
  }

  hasFailures(): boolean {
    return this.isFailing() || this.isWarning();
  }

  isPending(): boolean {
    return this.status === STATUS_PENDING;
  }

  isTested(): boolean {
    return this.hasFailures() || this.isPassing();
  }

  isOmitted(): boolean {
    return this.status === STATUS_OMITTED;
  }

  isUntested(): boolean {
    return this.status === STATUS_UNTESTED;
  }

  isFailing(): boolean {
    return this.status === STATUS_FAILED;
  }

  isCanceled(): boolean {
    return this.status === STATUS_CANCELED;
  }

  isSkipped(): boolean {
    return this.status === STATUS_SKIPPED;
  }

  isPassing(): boolean {
    return this.status === STATUS_PASSING;
  }

  isWarning(): boolean {
    return this.status === STATUS_WARNING;
  }
}

type TAsyncTest = Promise<string | void>;
export type TTestResult = TAsyncTest | boolean | void;
export type TTestFn = () => TTestResult;

const STATUS_UNTESTED = 'UNTESTED';
const STATUS_SKIPPED = 'SKIPPED';
const STATUS_FAILED = 'FAILED';
const STATUS_WARNING = 'WARNING';
const STATUS_PASSING = 'PASSING';
const STATUS_PENDING = 'PENDING';
const STATUS_CANCELED = 'CANCELED';
const STATUS_OMITTED = 'OMITTED';

type KStatus =
  | 'UNTESTED'
  | 'SKIPPED'
  | 'FAILED'
  | 'WARNING'
  | 'PASSING'
  | 'PENDING'
  | 'CANCELED'
  | 'OMITTED';
