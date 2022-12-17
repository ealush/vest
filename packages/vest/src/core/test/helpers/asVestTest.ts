import { VestTest } from 'VestTest';
import { invariant } from 'vest-utils';

import { ErrorStrings } from 'ErrorStrings';

export function asVestTest(value: any): VestTest {
  invariant(value instanceof VestTest, ErrorStrings.EXPECTED_VEST_TEST);
  return value;
}
