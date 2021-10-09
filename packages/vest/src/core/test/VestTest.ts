import genId from 'genId';

import removeTestFromState from 'removeTestFromState';
import shouldUseErrorAsMessage from 'shouldUseErrorAsMessage';

export default class VestTest {
  fieldName: string;
  testFn: TTestFn;
  asyncTest?: TAsyncTest;
  groupName?: string;
  message?: string;

  id = genId();
  warns = false;
  status: KStatus = STATUS_UNTESTED;

  constructor(
    fieldName: string,
    testFn: TTestFn,
    { message, groupName }: { message?: string; groupName?: string } = {}
  ) {
    this.fieldName = fieldName;
    this.testFn = testFn;

    if (groupName) {
      this.groupName = groupName;
    }

    if (message) {
      this.message = message;
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

  setPending() {
    this.setStatus(STATUS_PENDING);
  }

  fail(): void {
    this.setStatus(this.warns ? STATUS_WARNING : STATUS_FAILED);
  }

  done(): void {
    if (this.isFinalStatus()) {
      return;
    }
    this.setStatus(STATUS_PASSING);
  }

  warn(): void {
    this.warns = true;
  }

  isFinalStatus(): boolean {
    return this.hasFailures() || this.isCanceled() || this.isPassing();
  }

  skip(): void {
    this.setStatus(STATUS_SKIPPED);
  }

  cancel(): void {
    this.setStatus(STATUS_CANCELED);
    removeTestFromState(this);
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
