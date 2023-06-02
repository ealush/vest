import { ErrorStrings } from 'ErrorStrings';
import { invariant } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';

export function asVestTest(value: any): IsolateTest {
  invariant(value instanceof IsolateTest, ErrorStrings.EXPECTED_VEST_TEST);
  return value;
}
