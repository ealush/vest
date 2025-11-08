import { Nullable, TStateMachineApi } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

import { CommonStateMachine, CommonStates } from 'CommonStateMachine';

export class VestIsolate {
  static stateMachine: TStateMachineApi = CommonStateMachine;

  static getStatus(isolate: TIsolate): string {
    return isolate.status ?? CommonStates.INITIAL;
  }

  static setStatus(isolate: TIsolate, status: string, payload?: any): void {
    isolate.status = this.stateMachine.staticTransition(
      VestIsolate.getStatus(isolate),
      status,
      payload,
    );
  }

  static statusEquals(isolate: TIsolate, status: string): boolean {
    return VestIsolate.getStatus(isolate) === status;
  }

  static setPending(isolate: TIsolate): void {
    this.setStatus(isolate, CommonStates.PENDING);
  }

  static setDone(isolate: TIsolate): void {
    this.setStatus(isolate, CommonStates.DONE);
  }

  static isPending(isolate: TIsolate): boolean {
    return VestIsolate.statusEquals(isolate, CommonStates.PENDING);
  }

  static getParent(isolate: TIsolate): Nullable<TIsolate> {
    return isolate.parent;
  }
}
