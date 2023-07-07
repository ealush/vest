import { Isolate } from 'Isolate';

export function isIsolateType(node: Isolate, type: string): node is Isolate {
  return node.type === type;
}

export function isSameIsolateType<A extends Isolate, B extends Isolate>(
  a: A,
  b: B
): boolean {
  return a.type === b.type;
}

export function isSameIsolateIdentity<A extends Isolate, B extends Isolate>(
  a: A,
  b: B
): boolean {
  return Object.is(a, b) || (isSameIsolateType(a, b) && a.key === b.key);
}
