import { bindNot } from 'vest-utils';

import { VestTest } from 'VestTest';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: VestTest,
  groupName: string | void
): boolean {
  return testObject.groupName === groupName;
}
