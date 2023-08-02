import { Nullable, invariant, isNullish } from 'vest-utils';

import { TIsolate } from 'Isolate';

export class IsolateMutator {
  static setParent(isolate: TIsolate, parent: Nullable<TIsolate>): TIsolate {
    isolate.parent = parent;
    return isolate;
  }

  static saveOutput(isolate: TIsolate, output: any): TIsolate {
    isolate.output = output;
    return isolate;
  }

  static setKey(isolate: TIsolate, key: Nullable<string>): TIsolate {
    isolate.key = key;
    return isolate;
  }

  static addChild(isolate: TIsolate, child: TIsolate): void {
    invariant(isolate);

    isolate.children = isolate.children ?? [];

    isolate.children.push(child);
    IsolateMutator.setParent(child, isolate);
  }

  static removeChild(isolate: TIsolate, node: TIsolate): void {
    isolate.children =
      isolate.children?.filter(child => child !== node) ?? null;
  }

  static addChildKey(isolate: TIsolate, key: string, node: TIsolate): void {
    invariant(isolate);

    isolate.keys = isolate.keys ?? {};

    isolate.keys[key] = node;
  }

  static slice(isolate: TIsolate, at: number): void {
    if (isNullish(isolate.children)) {
      return;
    }
    isolate.children.length = at;
  }

  static setData(isolate: TIsolate, data: any): void {
    isolate.data = data;
  }
}
