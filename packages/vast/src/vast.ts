import isFunction from 'isFunction';
import optionalFunctionValue from 'optionalFunctionValue';

// eslint-disable-next-line max-lines-per-function
export function createState(
  onStateChange?: (...args: unknown[]) => unknown
): TCreateStateReturn {
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
    initialState?: TStateInput<S>,
    onUpdate?: () => void
  ): () => TStateHandlerReturn<S> {
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
    initialState?: TStateInput<S>,
    prevState?: S | undefined
  ) {
    current().push();
    set(key, optionalFunctionValue(initialState, prevState));

    return function useStateKey(): TStateHandlerReturn<S> {
      return [
        current()[key],
        (nextState: TSetStateInput<S>) =>
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

type TStateInput<S> = S | ((prevState?: S) => S);
type TSetStateInput<S> = S | ((prevState: S) => S);

export type TState = ReturnType<typeof createState>;
export type TStateHandlerReturn<S> = [
  S,
  (nextState: TSetStateInput<S>) => void
];

type TCreateStateReturn = {
  reset: () => void;
  registerStateKey: <S>(
    initialState?: TStateInput<S> | undefined,
    onUpdate?: (() => void) | undefined
  ) => () => TStateHandlerReturn<S>;
};
