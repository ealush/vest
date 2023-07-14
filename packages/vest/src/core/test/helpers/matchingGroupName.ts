import { Maybe, bindNot } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { TGroupName } from 'SuiteResultTypes';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: TIsolateTest,
  groupName: Maybe<TGroupName>
): boolean {
  return testObject.groupName === groupName;
}
