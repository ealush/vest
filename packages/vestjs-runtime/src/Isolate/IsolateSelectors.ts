import { Maybe } from 'vest-utils';

import { TIsolate } from 'Isolate';

export function isIsolateType<I extends TIsolate>(
  node: Maybe<TIsolate>,
  type: string
): node is I {
  return node?.type === type;
}

export function isSameIsolateType<A extends TIsolate, B extends TIsolate>(
  a: A,
  b: B
): boolean {
  return isIsolateType(a, b.type);
}

export function isSameIsolateIdentity<A extends TIsolate, B extends TIsolate>(
  a: A,
  b: B
): boolean {
  return Object.is(a, b) || (isSameIsolateType(a, b) && a.key === b.key);
}
