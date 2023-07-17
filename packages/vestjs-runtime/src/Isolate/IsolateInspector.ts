import { Nullable, isNotNullish, isNullish } from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateKeys } from 'IsolateKeys';

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
    isolate: Nullable<I>
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
    key: string
  ): Nullable<TIsolate> {
    if (isNullish(isolate)) {
      return null;
    }
    return isolate.keys?.[key] ?? null;
  }

  static dump(isolate: TIsolate): string {
    return JSON.stringify(isolate, (key, value) => {
      if (isKeyExcluededFromDump(key)) {
        return undefined;
      }
      // Remove nullish values from dump
      return isNullish(value) ? undefined : value;
    });
  }
}

function isKeyExcluededFromDump(key: string): boolean {
  return [IsolateKeys.Parent, IsolateKeys.Keys].includes(key as IsolateKeys);
}
