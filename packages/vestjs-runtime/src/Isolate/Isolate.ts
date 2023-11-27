import { CB, Maybe, Nullable, isNotNullish, isPromise } from 'vest-utils';

import { useEmit } from 'Bus';
import { IsolateKeys } from 'IsolateKeys';
import { IsolateMutator } from 'IsolateMutator';
import { Reconciler } from 'Reconciler';
import { RuntimeEvents } from 'RuntimeEvents';
import * as VestRuntime from 'VestRuntime';

export type IsolateKey = Nullable<string>;

export type TIsolate<P extends IsolatePayload = IsolatePayload> = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Parent]: Nullable<TIsolate>;
  [IsolateKeys.Type]: string;
  [IsolateKeys.Keys]: Nullable<Record<string, TIsolate>>;
  [IsolateKeys.Data]: DataOnly<P>;
  [IsolateKeys.Status]?: string;
  [IsolateKeys.AbortController]: AbortController;
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
    payload: Maybe<Payload> = undefined,
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

  static isIsolate(node: any): node is TIsolate {
    return isNotNullish(node) && node[IsolateKeys.Type];
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
  const emit = useEmit();

  // We're creating a new child isolate context where the local history node
  // is the current history node, thus advancing the history cursor.
  const output = VestRuntime.Run(
    {
      historyNode: localHistoryNode,
      runtimeNode: current,
      ...(!runtimeRoot && { runtimeRoot: current }),
    },
    () => {
      emit(RuntimeEvents.ISOLATE_ENTER, current);
      const output = callback(current);

      if (isPromise(output)) {
        emit(RuntimeEvents.ISOLATE_PENDING, current);
        output.then(iso => {
          if (Isolate.isIsolate(iso)) {
            IsolateMutator.addChild(current, iso);
          }

          emit(RuntimeEvents.ISOLATE_DONE, current);
        });
      } else {
        emit(RuntimeEvents.ISOLATE_DONE, current);
      }

      return output;
    }
  );

  current.output = output;
  return output;
}

function baseIsolate(
  type: string,
  payload: Maybe<IsolatePayload> = undefined,
  key: IsolateKey = null
): TIsolate {
  const { allowReorder, status, ...data } = payload ?? {};
  return {
    [IsolateKeys.AllowReorder]: allowReorder,
    [IsolateKeys.AbortController]: new AbortController(),
    [IsolateKeys.Keys]: null,
    [IsolateKeys.Parent]: null,
    [IsolateKeys.Type]: type,
    [IsolateKeys.Data]: data as IsolateData,
    ...(status && { [IsolateKeys.Status]: status }),
    children: null,
    key,
    output: null,
  };
}

type IsolateData = Record<string, any>;
type IsolatePayload = IsolateData & IsolateFeatures;
type IsolateFeatures = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Status]?: string;
};
