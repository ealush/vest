import { seq } from 'vest-utils';

import { AsyncTest, TestFn } from 'TestTypes';

enum TestSeverity {
  Error = 'error',
  Warning = 'warning',
}

export class VestTest {
  name: string;
  testFn: TestFn;
  groupName?: string;
  message?: string;
  // asyncTest: AsyncTest | null;
  // key?: null | string = null;

  id = seq();
  severity = TestSeverity.Error;

  constructor(
    name: string,
    testFn: TestFn,
    {
      message,
      groupName,
    }: // key,
    { message?: string; groupName?: string; key?: string } = {}
  ) {
    this.name = name;
    this.testFn = testFn;

    if (groupName) {
      this.groupName = groupName;
    }

    if (message) {
      this.message = message;
    }
  }
}
