import genId from 'genId';
import isStringValue from 'isStringValue';
import { isUndefined } from 'isUndefined';

import { removePending } from 'pending';
import removeTestFromState from 'removeTestFromState';

export type TAsyncTest = Promise<string | void>;
export type TTestResult = TAsyncTest | boolean | void;
export type TTestFn = () => TTestResult;

export default class VestTest {
  fieldName: string;
  testFn: TTestFn;
  asyncTest?: TAsyncTest;
  groupName?: string;
  message?: string;

  id = genId();
  failed = false;
  isWarning = false;
  canceled = false;

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
      if (isUndefined(this.message) && isStringValue(error)) {
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
    this.failed = true;
  }

  warn(): void {
    this.isWarning = true;
  }

  cancel(): void {
    this.canceled = true;
    removePending(this);
    removeTestFromState(this);
  }

  valueOf(): boolean {
    return this.failed !== true;
  }
}
