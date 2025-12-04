import { CB, Maybe, Nullable, isNotNullish, isPromise } from 'vest-utils';

import { useEmit } from '../Bus';
import { Reconciler } from '../Reconciler';
import { RuntimeEvents } from '../RuntimeEvents';
import * as VestRuntime from '../VestRuntime';

import { IsolateKeys } from './IsolateKeys';
import { IsolateMutator } from './IsolateMutator';
import { IsolateStateMachine } from './IsolateStateMachine';
import { IsolateStatus } from './IsolateStatus';

export type IsolateKey = Nullable<string>;

export type TIsolate<P extends IsolatePayload = IsolatePayload> = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Parent]: Nullable<TIsolate>;
  [IsolateKeys.Type]: string;
  [IsolateKeys.Keys]: Nullable<Record<string, TIsolate>>;
  [IsolateKeys.Data]: DataOnly<P>;
  [IsolateKeys.Status]: IsolateStatus;
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
  // eslint-disable-next-line max-statements
  static create<Payload extends IsolatePayload>(
    type: string,
    callback: CB,
    payload: Maybe<Payload> = undefined,
    key?: IsolateKey,
  ): TIsolate<Payload> {
    const parent = VestRuntime.useIsolate();

    const newCreatedNode = IsolateMutator.setParent(
      baseIsolate(type, payload, key),
      parent,
    );

    const nextIsolateChild = Reconciler.reconcile(newCreatedNode);

    const localHistoryNode = VestRuntime.useHistoryIsolateAtCurrentPosition();

    const shouldRunNew = Object.is(nextIsolateChild, newCreatedNode);

    if (parent) {
      // We are within an isolate context. This means that
      // we need to set the new node to be the child of this parent node.
      VestRuntime.useSetNextIsolateChild(nextIsolateChild);
    }

    let output;

    if (shouldRunNew) {
      output = useRunAsNew(localHistoryNode, newCreatedNode, callback);
    } else {
      const emit = useEmit();
      output = nextIsolateChild.output;
      emit(RuntimeEvents.ISOLATE_RECONCILED, nextIsolateChild);
    }

    IsolateMutator.saveOutput(nextIsolateChild, output);

    if (!parent) {
      // We're exiting the node, and there is no parent. This means
      // that we're at the top level and this node should be set
      // as the new root of the history tree.
      VestRuntime.useSetHistoryRoot(nextIsolateChild);
    }

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
  callback: CB,
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
    () => useRunAsNewCallback(current, callback),
  );

  current.output = output;
  return output;
}

function useRunAsNewCallback(current: TIsolate, callback: CB): any {
  const emit = useEmit();
  emit(RuntimeEvents.ISOLATE_ENTER, current);
  const output = callback(current);

  if (isPromise(output)) {
    emit(RuntimeEvents.ISOLATE_PENDING, current);
    IsolateMutator.setStatus(
      current,
      IsolateStateMachine.staticTransition(
        current.status,
        IsolateStatus.PENDING,
      ) as IsolateStatus,
    );
    output.then(iso => {
      if (Isolate.isIsolate(iso)) {
        IsolateMutator.addChild(current, iso);
      }

      emit(RuntimeEvents.ISOLATE_DONE, current);
      IsolateMutator.setStatus(
        current,
        IsolateStateMachine.staticTransition(
          current.status,
          IsolateStatus.DONE,
        ) as IsolateStatus,
      );
      emit(RuntimeEvents.ASYNC_ISOLATE_DONE, current);
    });
  } else {
    emit(RuntimeEvents.ISOLATE_DONE, current);
    IsolateMutator.setStatus(
      current,
      IsolateStateMachine.staticTransition(
        current.status,
        IsolateStatus.DONE,
      ) as IsolateStatus,
    );
  }

  return output;
}

function baseIsolate(
  type: string,
  payload: Maybe<IsolatePayload> = undefined,
  key: IsolateKey = null,
): TIsolate {
  const { allowReorder, status, ...data } = payload ?? {};
  return {
    [IsolateKeys.AllowReorder]: allowReorder,
    [IsolateKeys.AbortController]: new AbortController(),
    [IsolateKeys.Keys]: null,
    [IsolateKeys.Parent]: null,
    [IsolateKeys.Type]: type,
    [IsolateKeys.Data]: data,
    [IsolateKeys.Status]: status ?? IsolateStatus.INITIAL,
    children: null,
    key,
    output: null,
  };
}

type IsolatePayload<P = Record<string, any>> = P & IsolateFeatures;
type IsolateFeatures = {
  [IsolateKeys.AllowReorder]?: boolean;
  [IsolateKeys.Status]?: IsolateStatus;
};
