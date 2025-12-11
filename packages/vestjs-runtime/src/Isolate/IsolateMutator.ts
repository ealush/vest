import {
  Nullable,
  invariant,
  isNullish,
  makeResult,
  Result,
  isFailure,
} from 'vest-utils';

import { RuntimeApi } from '../VestRuntime';

import { IsolateStateMachine } from './IsolateStateMachine';
import { IsolateStatus } from './IsolateStatus';
import { IsolateInspector } from './IsolateInspector';

import { TIsolate } from './Isolate';

function bubbleUpPending(isolate: Nullable<TIsolate>): void {
  if (isNullish(isolate)) {
    return;
  }
  // If parent is already HAS_PENDING, we can stop the upward traversal.
  if (IsolateInspector.isHasPending(isolate)) {
    return;
  }

  const result = IsolateMutator.setHasPending(isolate);

  if (isFailure(result)) {
    return;
  }

  bubbleUpPending(isolate.parent);
}

function bubbleUpDone(isolate: Nullable<TIsolate>): void {
  if (isNullish(isolate)) {
    return;
  }

  if (!IsolateInspector.isHasPending(isolate)) {
    return;
  }

  const result = IsolateMutator.setStatus(isolate, IsolateStatus.DONE, isolate);

  if (isFailure(result)) {
    return;
  }

  bubbleUpDone(isolate.parent);
}

export class IsolateMutator {
  static setParent(isolate: TIsolate, parent: Nullable<TIsolate>): TIsolate {
    isolate.parent = parent;
    return isolate;
  }

  static saveOutput(isolate: TIsolate, output: any): TIsolate {
    isolate.output = output;
    return isolate;
  }

  static setKey(isolate: TIsolate, key: Nullable<string>): TIsolate {
    isolate.key = key;
    return isolate;
  }

  static addChild(isolate: TIsolate, child: TIsolate): void {
    invariant(isolate);

    isolate.children = isolate.children ?? [];

    isolate.children.push(child);
    IsolateMutator.setParent(child, isolate);
  }

  static removeChild(isolate: TIsolate, node: TIsolate): void {
    isolate.children =
      isolate.children?.filter(child => child !== node) ?? null;
  }

  static addChildKey(isolate: TIsolate, key: string, node: TIsolate): void {
    invariant(isolate);

    isolate.keys = isolate.keys ?? {};

    isolate.keys[key] = node;
  }

  static slice(isolate: TIsolate, at: number): void {
    if (isNullish(isolate.children)) {
      return;
    }
    isolate.children.length = at;
  }

  static setData(isolate: TIsolate, data: any): void {
    isolate.data = data;
  }

  static abort(isolate: TIsolate, reason?: string): void {
    if (isNullish(isolate.abortController)) {
      return;
    }
    isolate.abortController.abort(reason);
  }

  static setStatus(
    isolate: TIsolate,
    status: IsolateStatus,
    payload?: any,
  ): Result<IsolateStatus, string> {
    if (isolate.status === status) {
      return makeResult.Err(`Isolate status is already ${status}`);
    }

    isolate.status = IsolateStateMachine.staticTransition(
      isolate.status ?? IsolateStatus.INITIAL,
      status,
      payload,
    ) as IsolateStatus;

    return makeResult.Ok(isolate.status);
  }

  static setPending(isolate: TIsolate): void {
    const result = IsolateMutator.setStatus(isolate, IsolateStatus.PENDING);

    if (isFailure(result)) {
      return;
    }

    RuntimeApi.registerPending(isolate);

    // Bubble up the HAS_PENDING status to all ancestors.
    bubbleUpPending(isolate.parent);
  }

  static setHasPending(isolate: TIsolate): Result<IsolateStatus, string> {
    return IsolateMutator.setStatus(isolate, IsolateStatus.HAS_PENDING);
  }

  static setDone(isolate: TIsolate): void {
    const result = IsolateMutator.setStatus(
      isolate,
      IsolateStatus.DONE,
      isolate,
    );

    if (isFailure(result)) {
      return;
    }

    // Bubble up the DONE status to ancestors if no other children are pending.
    bubbleUpDone(isolate.parent);

    RuntimeApi.removePending(isolate);
  }
}
