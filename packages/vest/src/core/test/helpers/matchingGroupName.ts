import { Maybe, bindNot } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { TGroupName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: TIsolateTest,
  groupName: Maybe<TGroupName>
): boolean {
  return VestTest.getData(testObject).groupName === groupName;
}
