import { invariant, isNullish } from 'vest-utils';

import { Isolate } from 'Isolate';
import { useHistoryKey, useSetIsolateKey } from 'PersistedContext';
import { asVestTest } from 'asVestTest';
import { getIsolateTestX } from 'getIsolateTest';

export function handleIsolateNodeWithKey(node: Isolate): Isolate {
  const testObject = getIsolateTestX(node);

  invariant(node.usesKey());

  const prevNodeByKey = useHistoryKey(testObject.key);

  let nextNode = node;

  if (!isNullish(prevNodeByKey)) {
    asVestTest(prevNodeByKey.data);

    nextNode = prevNodeByKey;
  }

  useSetIsolateKey(node.key, node);

  return nextNode;
}
