import { isFunction, optionalFunctionValue } from 'vest-utils';

// eslint-disable-next-line max-lines-per-function
export function createState(
  onStateChange?: (...args: unknown[]) => unknown
): CreateStateReturn {
  const state: {
    references: unknown[];
  } = {
    references: [],
  };

  const registrations: [
    unknown,
    (<S>(currentState: S, prevState: S) => void)?
  ][] = [];

  return {
    registerStateKey,
    reset,
  };

  /**
   * Registers a new key in the state, takes the initial value (may be a function that returns the initial value), returns a function.
   *
   * @example
   *
   * const useColor = state.registerStateKey("blue");
   *
   * let [color, setColor] = useColor(); // -> ["blue", Function]
   *
   * setColor("green");
   *
   * useColor()[0]; -> "green"
   */
  function registerStateKey<S>(
    initialState?: StateInput<S>,
    onUpdate?: () => void
  ): () => StateHandlerReturn<S> {
    const key = registrations.length;
    registrations.push([initialState, onUpdate]);
    return initKey(key, initialState);
  }

  function reset(): void {
    const prev = current();
    state.references = [];
    registrations.forEach(([initialValue], index) =>
      initKey(index, initialValue, prev[index])
    );
  }

  function initKey<S>(
    key: number,
    initialState?: StateInput<S>,
    prevState?: S | undefined
  ) {
    current().push();
    set(key, optionalFunctionValue(initialState, prevState));

    return function useStateKey(): StateHandlerReturn<S> {
      return [
        current()[key],
        (nextState: SetStateInput<S>) =>
          set(key, optionalFunctionValue(nextState, current()[key])),
      ];
    };
  }

  function current(): any[] {
    return state.references;
  }

  function set(index: number, value: unknown): void {
    const prevValue = state.references[index];
    state.references[index] = value;

    const [, onUpdate] = registrations[index];

    if (isFunction(onUpdate)) {
      onUpdate(value, prevValue);
    }

    if (isFunction(onStateChange)) {
      onStateChange();
    }
  }
}

type StateInput<S> = S | ((prevState?: S) => S);
type SetStateInput<S> = S | ((prevState: S) => S);

export type State = ReturnType<typeof createState>;
export type StateHandlerReturn<S> = [S, (nextState: SetStateInput<S>) => void];
export type UseState<S> = () => StateHandlerReturn<S>;

type CreateStateReturn = {
  reset: () => void;
  registerStateKey: <S>(
    initialState?: StateInput<S> | undefined,
    onUpdate?: (() => void) | undefined
  ) => () => StateHandlerReturn<S>;
};
