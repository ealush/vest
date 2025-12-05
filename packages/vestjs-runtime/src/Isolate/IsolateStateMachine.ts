import { StateMachine, TStateMachine } from 'vest-utils';

import { IsolateStatus } from './IsolateStatus';

const machine: TStateMachine<IsolateStatus> = {
  initial: IsolateStatus.INITIAL,
  states: {
    [IsolateStatus.DONE]: {},
    [IsolateStatus.INITIAL]: {
      [IsolateStatus.PENDING]: IsolateStatus.PENDING,
      [IsolateStatus.DONE]: IsolateStatus.DONE,
    },
    [IsolateStatus.PENDING]: {
      [IsolateStatus.DONE]: IsolateStatus.DONE,
    },
  },
};

export const IsolateStateMachine = StateMachine(machine);
