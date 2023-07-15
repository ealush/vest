import {
  Nullable,
  invariant,
  isNullish,
  optionalFunctionValue,
} from 'vest-utils';

import { TIsolate } from 'Isolate';
import { IsolateInspector } from 'IsolateInspector';

export class IsolateMutator {
  static setParent(isolate: TIsolate, parent: Nullable<TIsolate>): TIsolate {
    isolate.parent = parent;
    return isolate;
  }

  static allowReorder(isolate: TIsolate): TIsolate {
    isolate.allowReorder = true;
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
    invariant(isolate.children);
    isolate.children.push(child);
    IsolateMutator.setParent(child, isolate);
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

  static setData(
    isolate: TIsolate,
    key: string,
    setter: ((currentValue: any) => any) | any
  ): void {
    isolate.data = isolate.data ?? {};
    isolate.data[key] = optionalFunctionValue(
      setter,
      IsolateInspector.getData(isolate)
    );
  }
}
