import { Maybe } from 'vest-utils';

import { Isolate } from 'Isolate';

export function isIsolateType<I extends Isolate>(
  node: Maybe<Isolate>,
  type: string
): node is I {
  return node?.type === type;
}

export function isSameIsolateType<A extends Isolate, B extends Isolate>(
  a: A,
  b: B
): boolean {
  return isIsolateType(a, b.type);
}

export function isSameIsolateIdentity<A extends Isolate, B extends Isolate>(
  a: A,
  b: B
): boolean {
  return Object.is(a, b) || (isSameIsolateType(a, b) && a.key === b.key);
}
