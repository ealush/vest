import { StateMachine, TStateMachine } from 'vest-utils';

import { TIsolate } from './Isolate';
import { IsolateInspector } from './IsolateInspector';

import { IsolateStatus } from './IsolateStatus';

const machine: TStateMachine<IsolateStatus> = {
  initial: IsolateStatus.INITIAL,
  states: {
    [IsolateStatus.DONE]: {},
    [IsolateStatus.INITIAL]: {
      [IsolateStatus.PENDING]: IsolateStatus.PENDING,
      [IsolateStatus.HAS_PENDING]: IsolateStatus.HAS_PENDING,
      [IsolateStatus.DONE]: IsolateStatus.DONE,
    },
    [IsolateStatus.PENDING]: {
      [IsolateStatus.DONE]: IsolateStatus.DONE,
    },
    [IsolateStatus.HAS_PENDING]: {
      [IsolateStatus.DONE]: [
        IsolateStatus.DONE,
        (isolate: TIsolate) => !IsolateInspector.hasActiveChildren(isolate),
      ],
      [IsolateStatus.PENDING]: IsolateStatus.PENDING,
    },
  },
};

export const IsolateStateMachine = StateMachine(machine);
