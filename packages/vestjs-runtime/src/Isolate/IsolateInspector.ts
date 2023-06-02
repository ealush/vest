import { isNotNullish, isNullish } from 'vest-utils';

import { Isolate } from 'Isolate';
import { closestExists } from 'IsolateWalker';

export class IsolateInspector {
  static at(isolate: Isolate | null, at: number): Isolate | null {
    if (isNullish(isolate)) {
      return null;
    }
    return isolate.children?.[at] ?? null;
  }

  static cursor(isolate: Isolate | null): number {
    if (isNullish(isolate)) {
      return 0;
    }
    return isolate.children?.length ?? 0;
  }

  static shouldAllowReorder(isolate: Isolate | null): boolean {
    if (isNullish(isolate)) {
      return false;
    }
    return closestExists(isolate, node => node.allowReorder) ?? false;
  }

  static usesKey(isolate: Isolate | null): boolean {
    if (isNullish(isolate)) {
      return false;
    }
    return isNotNullish(isolate.key);
  }
}
