import { invariant } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';
import { TIsolateTest } from 'IsolateTest';
import { isIsolateTest } from 'isIsolateTest';

export function asVestTest(value: any): TIsolateTest {
  invariant(isIsolateTest(value), ErrorStrings.EXPECTED_VEST_TEST);
  return value;
}
