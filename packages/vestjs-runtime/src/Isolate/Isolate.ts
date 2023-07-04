import { CB, Nullable } from 'vest-utils';

import { IsolateMutator } from 'IsolateMutator';
import { BaseReconciler, IRecociler, Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export class Isolate<_D = any> {
  children: Nullable<Isolate[]> = [];
  keys: Record<string, Isolate> = {};
  parent: Nullable<Isolate> = null;
  output: any;
  key: IsolateKey = null;
  allowReorder = false;
  type = 'Isolate';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  constructor(_data?: _D) {}

  static reconciler: IRecociler = BaseReconciler;

  static create<I extends Isolate, Callback extends CB = CB>(
    callback: Callback,
    data?: any
  ): I {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(new this(data), parent);

    const [nextIsolateChild, output] = Reconciler.reconcile(
      this.reconciler,
      newCreatedNode,
      callback
    );

    IsolateMutator.saveOutput(nextIsolateChild, output);

    VestRuntime.addNodeToHistory(nextIsolateChild);

    return nextIsolateChild as I;
  }
}
