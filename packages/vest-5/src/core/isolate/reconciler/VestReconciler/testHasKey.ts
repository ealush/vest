import { VestTest } from 'VestTest';
import { isNotNullish } from 'vest-utils';

export function testHasKey(testObject: VestTest): boolean {
  return isNotNullish(testObject.key);
}
