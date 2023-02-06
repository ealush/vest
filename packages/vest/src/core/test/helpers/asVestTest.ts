import { invariant } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { IsolateTest } from 'IsolateTest';

export function asVestTest(value: any): IsolateTest {
  invariant(value instanceof IsolateTest, ErrorStrings.EXPECTED_VEST_TEST);
  return value;
}
