import { Nullable, isNotNullish, isNullish } from 'vest-utils';

import { TIsolate } from 'Isolate';

export class IsolateInspector {
  static at(isolate: Nullable<TIsolate>, at: number): Nullable<TIsolate> {
    if (isNullish(isolate)) {
      return null;
    }
    return isolate.children?.[at] ?? null;
  }

  static cursor(isolate: Nullable<TIsolate>): number {
    if (isNullish(isolate)) {
      return 0;
    }
    return isolate.children?.length ?? 0;
  }

  static canReorder<I extends TIsolate>(isolate: Nullable<I>): boolean {
    if (isNullish(isolate)) {
      return false;
    }

    return IsolateInspector.allowsReorder(isolate.parent);
  }

  static allowsReorder<I extends Record<any, any>>(
    isolate: Nullable<I>,
  ): boolean {
    return isolate?.allowReorder === true;
  }

  static usesKey(isolate: Nullable<TIsolate>): boolean {
    if (isNullish(isolate)) {
      return false;
    }
    return isNotNullish(isolate.key);
  }

  static getChildByKey(
    isolate: Nullable<TIsolate>,
    key: string,
  ): Nullable<TIsolate> {
    if (isNullish(isolate)) {
      return null;
    }
    return isolate.keys?.[key] ?? null;
  }
}
