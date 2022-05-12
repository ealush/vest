import bindNot from 'bindNot';

import VestTest from 'VestTest';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export default function matchingGroupName(
  testObject: VestTest,
  groupName: string | void
): boolean {
  return testObject.groupName === groupName;
}
