import { CB } from 'vest-utils';

import { IsolateMutator } from 'IsolateMutator';
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(_data?: _D) {}

  static reconciler: IRecociler = BaseReconciler;

  static create<Callback extends CB = CB>(
    callback: Callback,
    data?: any
  ): Isolate {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(new this(data), parent);

    const [nextIsolateChild, output] = Reconciler.reconcile(
      this.reconciler,
      newCreatedNode,
      callback
    );

    IsolateMutator.saveOutput(nextIsolateChild, output);

    VestRuntime.addNodeToHistory(nextIsolateChild);

    return nextIsolateChild;
  }
}
