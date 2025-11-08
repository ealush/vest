import { Maybe } from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';

export function isIsolateType<I extends TIsolate>(
  node: Maybe<TIsolate>,
  type: string,
): node is I {
  return node?.[IsolateKeys.Type] === type;
}

export function isSameIsolateType<A extends TIsolate, B extends TIsolate>(
  a: A,
  b: B,
): boolean {
  return isIsolateType(a, b[IsolateKeys.Type]);
}

export function isSameIsolateIdentity<A extends TIsolate, B extends TIsolate>(
  a: A,
  b: B,
): boolean {
  return Object.is(a, b) || (isSameIsolateType(a, b) && a.key === b.key);
}
