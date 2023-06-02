import { invariant, isNullish } from 'vest-utils';

import { TIsolate } from 'Isolate';

export class IsolateMutator {
  static setParent(isolate: TIsolate, parent: TIsolate | null): TIsolate {
    isolate.parent = parent;
    return isolate;
  }

  static saveOutput(isolate: TIsolate, output: any): TIsolate {
    isolate.output = output;
    return isolate;
  }

  static setKey(isolate: TIsolate, key: string | null): TIsolate {
    isolate.key = key;
    return isolate;
  }

  static addChild(isolate: TIsolate, child: TIsolate): void {
    invariant(isolate.children);

    isolate.children.push(child);
  }

  static removeChild(isolate: TIsolate, node: TIsolate): void {
    isolate.children =
      isolate.children?.filter(child => child !== node) ?? null;
  }

  static slice(isolate: TIsolate, at: number): void {
    if (isNullish(isolate.children)) {
      return;
    }

    isolate.children.length = at;
  }
}
