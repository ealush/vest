import { CB, isNotNullish } from 'vest-utils';

import { IsolateTypes } from 'IsolateTypes';
import {
  useSetNextIsolateChild,
  useSetHistory,
  useIsolate,
} from 'PersistedContext';
import { Reconciler } from 'Reconciler';

export type IsolateKey = null | string;

export class Isolate<T extends IsolateTypes = IsolateTypes, _D = any> {
  type: T;
  children: Isolate[] = [];
  keys: Record<string, Isolate> = {};
  parent: Isolate | null = null;
  output?: any;
  key: IsolateKey = null;
  static reconciler = Reconciler;

  constructor(type: T, _data?: any) {
    this.type = type;
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
    return this.createImplementation(type, callback, data);
  }

  private static createImplementation<Callback extends CB = CB>(
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

    this.setNode(nextIsolateChild);

    return nextIsolateChild;
  }

  static setNode(node: Isolate): void {
    const parent = useIsolate();
    if (parent) {
      useSetNextIsolateChild(node);
    } else {
      useSetHistory(node);
    }
  }

  static is(node: any): boolean {
    return node instanceof Isolate;
  }
}
