import { Maybe, bindNot } from 'vest-utils';

import { TIsolateTest } from 'IsolateTest';
import { TGroupName } from 'SuiteResultTypes';
import { VestTestInspector } from 'VestTestInspector';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: TIsolateTest,
  groupName: Maybe<TGroupName>
): boolean {
  return VestTestInspector.getData(testObject).groupName === groupName;
}
