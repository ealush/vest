import asArray from 'asArray';
import { isArray } from 'isArrayValue';
import optionalFunctionValue from 'optionalFunctionValue';
import throwError from 'throwError';
import type { TStringable } from 'utilityTypes';

import { IsolateTypes } from 'IsolateTypes';
import VestTest, { TTestResult } from 'VestTest';
import { isolate } from 'isolate';
import type { TTestBase } from 'test';

export default function bindTestEach(test: TTestBase): (table: any[]) => {
  (fieldName: TStringable, message: TStringable, cb: TEachCb): VestTest[];
  (fieldName: TStringable, cb: TEachCb): VestTest[];
} {
  /**
   * Run multiple tests using a parameter table
   */
  function each(table: any[]) {
    if (!isArray(table)) {
      throwError('test.each: Expected table to be an array.');
    }

    function eachReturn(
      fieldName: TStringable,
      ...args: [message: TStringable, cb: TEachCb]
    ): VestTest[];
    function eachReturn(
      fieldName: TStringable,
      ...args: [cb: TEachCb]
    ): VestTest[];
    function eachReturn(
      fieldName: TStringable,
      ...args: [message: TStringable, cb: TEachCb] | [cb: TEachCb]
    ): VestTest[] {
      const [testFn, message] = args.reverse() as [TEachCb, string];
      return isolate({ type: IsolateTypes.EACH }, (): VestTest[] =>
        table.map((item: any): VestTest => {
          item = asArray(item);

          return test(
            optionalFunctionValue<string>(fieldName, ...item),
            optionalFunctionValue<string>(message, ...item),
            () => testFn(...item) // eslint-disable-line max-nested-callbacks
          );
        })
      ) as VestTest[];
    }

    return eachReturn;
  }

  return each;
}

type TEachCb = (...args: any[]) => TTestResult;
