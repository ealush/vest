import { CB, Nullable } from 'vest-utils';

import { IsolateMutator } from 'IsolateMutator';
import { Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export type TIsolate<Data extends IsolateData = IsolateData> = {
  key: IsolateKey;
  parent: Nullable<TIsolate>;
  children: Nullable<TIsolate[]>;
  output: any;
  type: string;
  keys: Record<string, TIsolate>;
  data: Data;
  allowReorder?: boolean;
};

export class Isolate {
  static create<Data extends IsolateData>(
    type: string,
    callback: CB,
    data: Nullable<Data> = null,
    key?: IsolateKey
  ): TIsolate<Data> {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(
      baseIsolate(type, data, key),
      parent
    );

    const [nextIsolateChild, output] = Reconciler.reconcile(
      newCreatedNode,
      callback
    );

    IsolateMutator.saveOutput(nextIsolateChild, output);

    VestRuntime.addNodeToHistory(nextIsolateChild);

    return nextIsolateChild as TIsolate<Data>;
  }
}

function baseIsolate(
  type: string,
  data: Nullable<IsolateData>,
  key: IsolateKey = null
): TIsolate {
  return {
    children: [],
    data,
    key,
    keys: {},
    output: null,
    parent: null,
    type,
  };
}

type IsolateData = Nullable<Record<string, any>>;
