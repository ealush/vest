import { bindNot } from 'vest-utils';

import { IsolateTest } from 'IsolateTest';
import { TGroupName } from 'SuiteResultTypes';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: IsolateTest,
  groupName: TGroupName | void
): boolean {
  return testObject.groupName === groupName;
}
