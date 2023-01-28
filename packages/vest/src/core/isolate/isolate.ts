import { CB } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import {
  useSetNextIsolateChild,
  useSetHistory,
  useIsolate,
} from 'PersistedContext';
import { Reconciler } from 'Reconciler';

export class Isolate<T extends IsolateTypes = IsolateTypes, D = any> {
  type: T;
  children: Isolate[] = [];
  keys: Record<string, Isolate> = {};
  parent: Isolate | null = null;
  data?: D;
  output?: any;
  key?: null | string = null;
  static reconciler = Reconciler;

  constructor(type: T, data?: any) {
    this.type = type;
    this.data = data;
  }

  setParent(parent: Isolate | null): this {
    this.parent = parent;
    return this;
  }

  saveOutput(output: any): void {
    this.output = output;
  }

  static create<Callback extends CB = CB>(
    type: IsolateTypes,
    callback: Callback,
    data?: any
  ): Isolate {
    const parent = useIsolate();

    const newCreatedNode = new Isolate(type, data).setParent(parent);

    const [nextIsolateChild, output] = this.reconciler.reconcile(
      newCreatedNode,
      callback
    );

    nextIsolateChild.saveOutput(output);

    if (parent) {
      useSetNextIsolateChild(nextIsolateChild);
    } else {
      useSetHistory(nextIsolateChild);
    }

    return nextIsolateChild;
  }
}
