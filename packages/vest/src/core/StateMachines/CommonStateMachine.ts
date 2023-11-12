import { StateMachine, TStateMachine, ValueOf } from 'vest-utils';

export const CommonStates = {
  PENDING: 'PENDING',
};

export const State = {
  [CommonStates.PENDING]: CommonStates.PENDING,
  INITIAL: 'INITIAL',
  DONE: 'DONE',
};

export type State = ValueOf<typeof State>;

const machine: TStateMachine<State> = {
  initial: State.INITIAL,
  states: {
    [State.DONE]: {},
    [State.INITIAL]: {
      [State.PENDING]: State.PENDING,
      [State.DONE]: State.DONE,
    },
    [State.PENDING]: {
      [State.DONE]: State.DONE,
    },
  },
};

export const CommonStateMachine = StateMachine<State>(machine);
