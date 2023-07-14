import { CB, Nullable } from 'vest-utils';

import { IsolateMutator } from 'IsolateMutator';
import { Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export type TIsolate = {
  key: IsolateKey;
  parent: Nullable<TIsolate>;
  children: Nullable<TIsolate[]>;
  output: any;
  type: string;
  keys: Record<string, TIsolate>;
};

export type BaseIsolatePayload = Record<string, any> & {
  key?: IsolateKey;
};

export function createIsolate<Payload extends BaseIsolatePayload>(
  type: string,
  callback: CB,
  payload: Payload = {} as Payload
): TIsolate & Payload {
  const parent = VestRuntime.useIsolate();

  const newCreatedNode = IsolateMutator.setParent(
    baseIsolate(type, payload),
    parent
  );

  const [nextIsolateChild, output] = Reconciler.reconcile(
    newCreatedNode,
    callback
  );

  IsolateMutator.saveOutput(nextIsolateChild, output);

  VestRuntime.addNodeToHistory(nextIsolateChild);

  return nextIsolateChild as TIsolate & Payload;
}

function baseIsolate(type: string, payload: Record<string, any>): TIsolate {
  return {
    children: [],
    key: null,
    keys: {},
    output: null,
    parent: null,
    type,
    ...payload,
  };
}
