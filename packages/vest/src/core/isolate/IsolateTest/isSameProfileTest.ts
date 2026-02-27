/**
 * Module: `src/core/isolate/IsolateTest/isSameProfileTest.ts`.
 *
 * Provides `isSameProfileTest`-related runtime and type utilities used by `vest`.
 */
import { makeResult, Result } from 'vest-utils';

import matchingFieldName from '../../test/helpers/matchingFieldName';

import { TIsolateTest } from './IsolateTest';
import { VestTest } from './VestTest';

export function isSameProfileTest(
  testObject1: TIsolateTest,
  testObject2: TIsolateTest,
): Result<boolean> {
  const gn1 = VestTest.getGroupName(testObject1);
  const { fieldName: fn2 } = VestTest.getData(testObject2);
  const gn2 = VestTest.getGroupName(testObject2);
  return makeResult.Ok(
    matchingFieldName(VestTest.getData(testObject1), fn2).unwrap() &&
      gn1 === gn2 &&
      // Specifically using == here. The reason is that when serializing
      // suite result, empty key gets removed, but it can also be null.
      testObject1.key == testObject2.key,
  );
}
