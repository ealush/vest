import { invariant, isNullish } from 'vest-utils';

import { Isolate } from 'Isolate';
import { useHistoryKey, useSetIsolateKey } from 'PersistedContext';
import { asVestTest } from 'asVestTest';

export function handleIsolateNodeWithKey(node: Isolate): Isolate {
  invariant(node.usesKey());

  const prevNodeByKey = useHistoryKey(node.key);

  let nextNode = node;

  if (!isNullish(prevNodeByKey)) {
    asVestTest(prevNodeByKey.data);

    nextNode = prevNodeByKey;
  }

  useSetIsolateKey(node.key, node);

  return nextNode;
}
