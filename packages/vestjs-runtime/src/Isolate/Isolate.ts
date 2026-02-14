import { CB, Maybe, Nullable, isNotNullish, isPromise } from 'vest-utils';

import { useEmit } from '../Bus';
import { Reconciler } from '../Reconciler';
import * as VestRuntime from '../VestRuntime';

import { IsolateKeys } from './IsolateKeys';
import { IsolateMutator } from './IsolateMutator';
import { IsolateStatus } from './IsolateStatus';
import type { IsolateKey, IsolatePayload, TIsolate } from './IsolateTypes';

export { IsolateKey, TIsolate };

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
      emit('ISOLATE_RECONCILED', nextIsolateChild);
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
  emit('ISOLATE_ENTER', current);
  const output = callback(current);

  if (isPromise(output)) {
    emit('ISOLATE_PENDING', current);
    IsolateMutator.setPending(current);
    output.then(
      VestRuntime.persist(iso => {
        if (Isolate.isIsolate(iso)) {
          IsolateMutator.addChild(current, iso);
        }

        IsolateMutator.setDone(current);
        emit('ASYNC_ISOLATE_DONE', current);
      }),
      VestRuntime.persist(() => {
        IsolateMutator.setDone(current);
        emit('ASYNC_ISOLATE_DONE', current);
      }),
    );
  } else {
    IsolateMutator.setDone(current);
  }

  return output;
}

class IsolateInstance implements TIsolate {
  [IsolateKeys.Type]: string;
  children: Nullable<TIsolate[]> = null;
  [IsolateKeys.Keys]: Nullable<Record<string, TIsolate>> = null;
  [IsolateKeys.Parent]: Nullable<TIsolate> = null;
  output: any = null;
  key: IsolateKey = null;
  [IsolateKeys.AllowReorder]: Maybe<boolean> = undefined;
  [IsolateKeys.Transient]: Maybe<boolean> = undefined;
  [IsolateKeys.Status]: IsolateStatus = IsolateStatus.INITIAL;
  [IsolateKeys.AbortController]: Nullable<AbortController> = null;
  [IsolateKeys.Data]: Maybe<any>;

  constructor(
    type: string,
    payload: Maybe<IsolatePayload> = undefined,
    key: IsolateKey = null,
  ) {
    this[IsolateKeys.Type] = type;
    this.key = key;
    const { allowReorder, transient, status, ...data } = payload ?? {};
    this[IsolateKeys.AllowReorder] = allowReorder;
    this[IsolateKeys.Transient] = transient;
    if (status) {
      this[IsolateKeys.Status] = status;
    }
    this[IsolateKeys.Data] = data;
  }
}

function baseIsolate(
  type: string,
  payload: Maybe<IsolatePayload> = undefined,
  key: IsolateKey = null,
): TIsolate {
  return new IsolateInstance(type, payload, key);
}
