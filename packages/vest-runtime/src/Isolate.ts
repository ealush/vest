import { closest, closestExists } from 'Walker';
import { CB, invariant, isNotNullish, isNullish } from 'vest-utils';

import { BaseReconciler, IRecociler, Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = null | string;

export class Isolate<_D = any> {
  children: Isolate[] | null = [];
  keys: Record<string, Isolate> = {};
  parent: Isolate | null = null;
  output?: any;
  key: IsolateKey = null;
  allowReorder = false;
  static reconciler: IRecociler = BaseReconciler;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
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

  get rootNode(): Isolate {
    return closest(this, node => isNullish(node.parent)) ?? this;
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
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = new this(data).setParent(parent);

    const [nextIsolateChild, output] = Reconciler.reconcile(
      this.reconciler,
      newCreatedNode,
      callback
    );

    nextIsolateChild.saveOutput(output);

    this.setNode(nextIsolateChild);

    return nextIsolateChild;
  }

  static setNode(node: Isolate): void {
    const parent = VestRuntime.useIsolate();
    if (parent) {
      VestRuntime.useSetNextIsolateChild(node);
    } else {
      VestRuntime.useSetHistory(node);
    }

    node.setParent(parent);
  }

  static is(node: any): boolean {
    return node instanceof Isolate;
  }
}
