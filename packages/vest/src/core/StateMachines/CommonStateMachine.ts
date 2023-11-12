import { StateMachine, TStateMachine, ValueOf } from 'vest-utils';
import { TIsolate } from 'vestjs-runtime';

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

function transition(from: State | undefined, to: State) {
  return CommonStateMachine.staticTransition(from ?? State.INITIAL, to);
}

export function setDone(isolate: TIsolate) {
  isolate.status = transition(isolate.status, State.DONE);
}

export function setPending(isolate: TIsolate) {
  isolate.status = transition(isolate.status, State.PENDING);
}

export const CommonStateMachine = StateMachine<State>(machine);
