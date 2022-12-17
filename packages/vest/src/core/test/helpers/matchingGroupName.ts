import { VestTest } from 'VestTest';
import { bindNot } from 'vest-utils';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: VestTest,
  groupName: string | void
): boolean {
  return testObject.groupName === groupName;
}
