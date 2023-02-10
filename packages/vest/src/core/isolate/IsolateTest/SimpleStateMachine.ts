export type TStateMachine<S extends string, A extends string> = {
  initial: S;
  states: {
    [key in S]: {
      [key in A]?: S | [S, (payload?: any) => boolean];
    };
  };
};

export function StateMachine<S extends string, A extends string>(
  machine: TStateMachine<S, A>
): { getState: () => S; transition: (action: A, payload?: any) => void } {
  let state = machine.initial;

  const api = { getState, transition };

  return api;

  function getState(): S {
    return state;
  }

  function transition(action: A, payload?: any): void {
    const transitionTo = machine.states[state][action];

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
