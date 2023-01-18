import { isNotNullish } from 'vest-utils';

import { VestTest } from 'VestTest';

export function testHasKey(testObject: VestTest): boolean {
  return isNotNullish(testObject.key);
}
