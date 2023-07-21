import { CB, Nullable } from 'vest-utils';

import { IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';
import { Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export type TIsolate = {
  key: IsolateKey;
  parent: Nullable<TIsolate>;
  children: Nullable<TIsolate[]>;
  output: any;
  [IsolateKeys.Type]: string;
  keys: Nullable<Record<string, TIsolate>>;
};

export class Isolate {
  static create<Payload extends Record<string, any>>(
    type: string,
    callback: CB,
    payload: Nullable<Payload> = null,
    key?: IsolateKey
  ): TIsolate & Payload {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(
      baseIsolate(type, payload, key),
      parent
    );

    const [nextIsolateChild, output] = Reconciler.reconcile(
      newCreatedNode,
      callback
    );

    IsolateMutator.setParent(nextIsolateChild, parent);
    IsolateMutator.saveOutput(nextIsolateChild, output);

    VestRuntime.addNodeToHistory(nextIsolateChild);

    return nextIsolateChild as TIsolate & Payload;
  }
}

function baseIsolate(
  type: string,
  payload: Nullable<IsolatePayload>,
  key: IsolateKey = null
): TIsolate {
  return {
    children: null,
    [IsolateKeys.Keys]: null,
    output: null,
    [IsolateKeys.Parent]: null,
    [IsolateKeys.Type]: type,
    ...payload,
    key,
  };
}

type IsolatePayload = Record<string, any>;
