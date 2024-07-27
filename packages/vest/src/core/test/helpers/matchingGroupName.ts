import { Maybe, bindNot } from 'vest-utils';

import { TIsolateTest } from '@/core/isolate/IsolateTest/IsolateTest';
import { VestTest } from '@/core/isolate/IsolateTest/VestTest';
import { TGroupName } from '@/suiteResult/SuiteResultTypes';

export const nonMatchingGroupName = bindNot(matchingGroupName);

export function matchingGroupName(
  testObject: TIsolateTest,
  groupName: Maybe<TGroupName>,
): boolean {
  return VestTest.getData(testObject).groupName === groupName;
}
