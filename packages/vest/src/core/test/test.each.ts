import asArray from 'asArray';
import optionalFunctionValue from 'optionalFunctionValue';
import throwError from 'throwError';

import VestTest, { TTestResult } from 'VestTest';
import { testBase } from 'test';

/* eslint-disable jest/no-export */
export default function bindTestEach(test: typeof testBase): (table: any[]) => {
  (fieldName: Stringable, message: Stringable, cb: TEachCb): VestTest[];
  (fieldName: Stringable, cb: TEachCb): VestTest[];
} {
  /**
   * Run multiple tests using a parameter table
   */
  function each(table: any[]) {
    if (!Array.isArray(table)) {
      throwError('test.each: Expected table to be an array.');
    }

    function eachReturn(
      fieldName: Stringable,
      ...args: [message: Stringable, cb: TEachCb]
    ): VestTest[];
    function eachReturn(
      fieldName: Stringable,
      ...args: [cb: TEachCb]
    ): VestTest[];
    function eachReturn(
      fieldName: Stringable,
      ...args: [message: Stringable, cb: TEachCb] | [cb: TEachCb]
    ): VestTest[] {
      const [testFn, message] = args.reverse() as [TEachCb, string];

      return table.map(item => {
        item = asArray(item);

        return test(
          optionalFunctionValue<string>(fieldName, ...item),
          optionalFunctionValue<string>(message, ...item),
          () => testFn(...item)
        );
      });
    }

    return eachReturn;
  }

  return each;
}

type Stringable = string | ((...args: any[]) => string);

type TEachCb = (...args: any[]) => TTestResult;
