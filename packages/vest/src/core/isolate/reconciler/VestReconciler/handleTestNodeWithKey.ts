import { invariant, isNullish } from 'vest-utils';

import { useHistoryKey, useSetIsolateKey } from 'PersistedContext';
import { asVestTest } from 'asVestTest';
import { getIsolateTestX } from 'getIsolateTest';
import { IsolateTest } from 'isolate';

export function handleTestNodeWithKey(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  invariant(testObject.key);

  const prevNodeByKey = useHistoryKey(testObject.key);

  let nextNode = testNode;

  if (!isNullish(prevNodeByKey)) {
    asVestTest(prevNodeByKey.data);

    nextNode = prevNodeByKey as IsolateTest;
  }

  useSetIsolateKey(testObject.key, testNode);

  return nextNode;
}
