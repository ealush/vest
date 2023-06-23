import { CB } from 'utilityTypes';

const STATE_WILD_CARD = '*';
type TStateWildCard = typeof STATE_WILD_CARD;

export type TStateMachine<S extends string, A extends string> = {
  initial: S;
  states: Partial<{
    [key in S & TStateWildCard]: {
      [key in A]?: S | [S, CB<boolean, [payload?: any]>];
    };
  }>;
};

export function StateMachine<S extends string, A extends string>(
  machine: TStateMachine<S, A>
): { getState: CB<S>; transition: (action: A, payload?: any) => void } {
  let state = machine.initial;

  const api = { getState, transition };

  return api;

  function getState(): S {
    return state;
  }

  // eslint-disable-next-line complexity
  function transition(action: A, payload?: any): void {
    const transitionTo =
      machine.states[state]?.[action] ??
      // @ts-expect-error - This is a valid state
      machine.states[STATE_WILD_CARD]?.[action];

    let target = transitionTo;

    if (Array.isArray(target)) {
      const [, conditional] = target;
      if (!conditional(payload)) {
        return;
      }

      target = target[0];
    }

    if (!target || target === state) {
      return;
    }

    state = target as S;
  }
}
