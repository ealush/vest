import { StateMachine, TStateMachine, ValueOf } from 'vest-utils';

export const CommonStates = {
  PENDING: 'PENDING',
  INITIAL: 'INITIAL',
  DONE: 'DONE',
};

const State = {
  [CommonStates.PENDING]: CommonStates.PENDING,
  [CommonStates.INITIAL]: CommonStates.INITIAL,
  [CommonStates.DONE]: CommonStates.DONE,
};

type State = ValueOf<typeof State>;

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

export const CommonStateMachine = StateMachine(machine);
