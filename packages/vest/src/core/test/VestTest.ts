import { seq } from 'vest-utils';

import shouldUseErrorAsMessage from 'shouldUseErrorAsMessage';
import { useRefreshTestObjects } from 'stateHooks';

enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
}

export default class VestTest {
  fieldName: string;
  testFn: TestFn;
  asyncTest?: AsyncTest;
  groupName?: string;
  message?: string;
  key?: null | string = null;

  id = seq();
  severity = TestSeverity.Error;
  status: KStatus = STATUS_UNTESTED;

  constructor(
    fieldName: string,
    testFn: TestFn,
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

  reset(): void {
    this.status = STATUS_UNTESTED;
    useRefreshTestObjects();
  }

  omit(): void {
    this.setStatus(STATUS_OMITTED);
  }

  valueOf(): boolean {
    return !this.isFailing();
  }

  isPending(): boolean {
    return this.statusEquals(STATUS_PENDING);
  }

  isOmitted(): boolean {
    return this.statusEquals(STATUS_OMITTED);
  }

  isUntested(): boolean {
    return this.statusEquals(STATUS_UNTESTED);
  }

  isFailing(): boolean {
    return this.statusEquals(STATUS_FAILED);
  }

  isCanceled(): boolean {
    return this.statusEquals(STATUS_CANCELED);
  }

  isSkipped(): boolean {
    return this.statusEquals(STATUS_SKIPPED);
  }

  isPassing(): boolean {
    return this.statusEquals(STATUS_PASSING);
  }

  isWarning(): boolean {
    return this.statusEquals(STATUS_WARNING);
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

  statusEquals(status: KStatus): boolean {
    return this.status === status;
  }
}

type AsyncTest = Promise<string | void>;
export type TestResult = AsyncTest | boolean | void;
export type TestFn = () => TestResult;

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
