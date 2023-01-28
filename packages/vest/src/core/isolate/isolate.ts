import { CB, isNotNullish } from 'vest-utils';

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
  data: D;
  output?: any;
  key: null | string = null;
  static reconciler = Reconciler;

  constructor(type: T, data?: any) {
    this.type = type;
    this.data = data;
  }

  setParent(parent: Isolate | null): this {
    this.parent = parent;
    return this;
  }

  saveOutput(output: any): this {
    this.output = output;
    return this;
  }

  setKey(key: string | null): this {
    this.key = key;
    return this;
  }

  usesKey(): boolean {
    return isNotNullish(this.key);
  }

  static create<Callback extends CB = CB>(
    type: IsolateTypes,
    callback: Callback,
    data?: any
  ): Isolate {
    const parent = useIsolate();

    const newCreatedNode = new this(type, data).setParent(parent);

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
