import { IsolateTest } from 'IsolateTypes';
import { getIsolateTestX } from 'getIsolateTest';
import { invariant, isNullish } from 'vest-utils';

import { useHistoryKey, useSetIsolateKey } from 'PersistedContext';

export function handleNodeWithKey(testNode: IsolateTest): IsolateTest {
  const testObject = getIsolateTestX(testNode);

  invariant(testObject.key);

  const prevNodeByKey = useHistoryKey(testObject.key);

  let nextNode = testNode;

  if (!isNullish(prevNodeByKey)) {
    // @ts-ignore
    nextNode = prevNodeByKey;
  }

  useSetIsolateKey(testObject.key, testNode);

  return nextNode;
}
