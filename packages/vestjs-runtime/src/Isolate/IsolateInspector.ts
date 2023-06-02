import { isNotNullish, isNullish } from 'vest-utils';

import { TIsolate } from 'Isolate';
import { closestExists } from 'IsolateWalker';

export class IsolateInspector {
  static at(isolate: TIsolate | null, at: number): TIsolate | null {
    if (isNullish(isolate)) {
      return null;
    }
    return isolate.children?.[at] ?? null;
  }

  static cursor(isolate: TIsolate | null): number {
    if (isNullish(isolate)) {
      return 0;
    }
    return isolate.children?.length ?? 0;
  }

  static shouldAllowReorder(isolate: TIsolate | null): boolean {
    if (isNullish(isolate)) {
      return false;
    }
    return closestExists(isolate, node => node.allowReorder) ?? false;
  }

  static usesKey(isolate: TIsolate | null): boolean {
    if (isNullish(isolate)) {
      return false;
    }
    return isNotNullish(isolate.key);
  }
}
