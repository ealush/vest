import genId from 'genId';

import { removePending } from 'pending';
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
  status:
    | 'UNTESTED'
    | 'SKIPPED'
    | 'FAILED'
    | 'WARNING'
    | 'PASSING'
    | 'PENDING'
    | 'CANCELED' = STATUS_UNTESTED;

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

  setPending() {
    this.status = STATUS_PENDING;
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

  fail(): void {
    this.status = this.warns ? STATUS_WARNING : STATUS_FAILED;
  }

  done(): void {
    if (this.isWarning() || this.isCanceled() || this.isFailing()) {
      return;
    }
    this.status = STATUS_PASSING;
  }

  warn(): void {
    this.warns = true;
  }

  skip(): void {
    this.status = STATUS_SKIPPED;
  }

  cancel(): void {
    this.status = STATUS_CANCELED;
    removePending(this);
    removeTestFromState(this);
  }

  valueOf(): boolean {
    return !this.isFailing();
  }

  hasFailures(): boolean {
    return this.isFailing() || this.isWarning();
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
