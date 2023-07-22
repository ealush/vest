import { CB, Nullable } from 'vest-utils';

import { IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';
import { Reconciler } from 'Reconciler';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export type TIsolate<P extends IsolatePayload = IsolatePayload> = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Parent]: Nullable<TIsolate>;
  [IsolateKeys.Type]: string;
  [IsolateKeys.Keys]: Nullable<Record<string, TIsolate>>;
  [IsolateKeys.Data]: DataOnly<P>;
  children: Nullable<TIsolate[]>;
  key: IsolateKey;
  output: any;
} & UsedFeaturesOnly<P>;

type DataOnly<P extends IsolatePayload> = Omit<P, keyof IsolateFeatures>;
type UsedFeaturesOnly<P extends IsolatePayload> = Pick<
  P,
  keyof IsolateFeatures
>;

export class Isolate {
  static create<Payload extends IsolatePayload>(
    type: string,
    callback: CB,
    payload: Payload,
    key?: IsolateKey
  ): TIsolate<Payload> {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(
      baseIsolate(type, payload, key),
      parent
    );

    const nextIsolateChild = Reconciler.reconcile(newCreatedNode);

    const localHistoryNode = VestRuntime.useHistoryIsolateAtCurrentPosition();

    const output = Object.is(nextIsolateChild, newCreatedNode)
      ? useRunAsNew(localHistoryNode, newCreatedNode, callback)
      : nextIsolateChild.output;

    IsolateMutator.setParent(nextIsolateChild, parent);
    IsolateMutator.saveOutput(nextIsolateChild, output);
    VestRuntime.addNodeToHistory(nextIsolateChild);

    return nextIsolateChild as TIsolate<Payload>;
  }
}

/**
 * Creates a new child isolate context where the local history node is the current history node, thus advancing the history cursor.
 * Runs the callback function and returns its output.
 * @param localHistoryNode The local history node.
 * @param current The current isolate.
 * @param callback The callback function to execute.
 * @returns The output of the callback function.
 */
function useRunAsNew<Callback extends CB = CB>(
  localHistoryNode: Nullable<TIsolate>,
  current: TIsolate,
  callback: CB
): ReturnType<Callback> {
  const runtimeRoot = VestRuntime.useRuntimeRoot();

  // We're creating a new child isolate context where the local history node
  // is the current history node, thus advancing the history cursor.
  const output = VestRuntime.Run(
    {
      historyNode: localHistoryNode,
      runtimeNode: current,
      ...(!runtimeRoot && { runtimeRoot: current }),
    },
    () => callback(current)
  );

  current.output = output;
  return output;
}

function baseIsolate(
  type: string,
  payload: Record<string, any>,
  key: IsolateKey = null
): TIsolate {
  const { allowReorder, ...data } = payload;
  return {
    [IsolateKeys.AllowReorder]: allowReorder,
    [IsolateKeys.Keys]: null,
    [IsolateKeys.Parent]: null,
    [IsolateKeys.Type]: type,
    [IsolateKeys.Data]: data as IsolateData,
    children: null,
    key,
    output: null,
  };
}

type IsolateData = Record<string, any>;
type IsolatePayload = IsolateData & IsolateFeatures;
type IsolateFeatures = {
  [IsolateKeys.AllowReorder]?: boolean;
};
