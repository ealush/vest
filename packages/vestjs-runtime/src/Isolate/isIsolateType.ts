import { Isolate } from 'Isolate';

export function isIsolateType(node: Isolate, type: string): node is Isolate {
  return node.type === type;
}
