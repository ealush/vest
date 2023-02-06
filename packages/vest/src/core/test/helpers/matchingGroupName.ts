import { bindNot } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: IsolateTest,
  groupName: string | void
): boolean {
  return testObject.groupName === groupName;
}
