import { CB, invariant, isNotNullish, isNullish } from 'vest-utils';
import { closestExists } from 'walker';

import {
  useSetNextIsolateChild,
  useSetHistory,
  useIsolate,
} from 'PersistedContext';
import { Reconciler } from 'Reconciler';

export type IsolateKey = null | string;

export class Isolate<_D = any> {
  children: Isolate[] | null = [];
  keys: Record<string, Isolate> = {};
  parent: Isolate | null = null;
  output?: any;
  key: IsolateKey = null;
  allowReorder = false;
  static reconciler = Reconciler;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(_data?: _D) {}

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

  addChild(child: Isolate): void {
    invariant(this.children);

    this.children.push(child);
  }

  removeChild(node: Isolate): void {
    this.children = this.children?.filter(child => child !== node) ?? null;
  }

  slice(at: number): void {
    if (isNullish(this.children)) {
      return;
    }

    this.children.length = at;
  }

  at(at: number): Isolate | null {
    return this.children?.[at] ?? null;
  }

  cursor(): number {
    return this.children?.length ?? 0;
  }

  shouldAllowReorder(): boolean {
    return closestExists(this, node => node.allowReorder) ?? false;
  }

  static create<Callback extends CB = CB>(
    callback: Callback,
    data?: any
  ): Isolate {
    return this.createImplementation(callback, data);
  }

  private static createImplementation<Callback extends CB = CB>(
    callback: Callback,
    data?: any
  ): Isolate {
    const parent = useIsolate();

    const newCreatedNode = new this(data).setParent(parent);

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
