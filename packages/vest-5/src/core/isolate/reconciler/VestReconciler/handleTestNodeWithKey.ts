import { IsolateTest } from 'IsolateTypes';
import { invariant, isNullish } from 'vest-utils';

import { useHistoryKey, useSetIsolateKey } from 'PersistedContext';
import { asVestTest } from 'asVestTest';
import { getIsolateTestX } from 'getIsolateTest';

export function handleNodeWithKey(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  invariant(testObject.key);

  const prevNodeByKey = useHistoryKey(testObject.key) as IsolateTest;

  asVestTest(prevNodeByKey.data);

  let nextNode = testNode;

  if (!isNullish(prevNodeByKey)) {
    nextNode = prevNodeByKey;
  }

  useSetIsolateKey(testObject.key, testNode);

  return nextNode;
}
