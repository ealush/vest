declare function createState(
  onStateChange?: (...args: unknown[]) => unknown
): TCreateStateReturn;
type TStateInput<S> = S | ((prevState?: S) => S);
type TSetStateInput<S> = S | ((prevState: S) => S);
type TState = ReturnType<typeof createState>;
type TStateHandlerReturn<S> = [S, (nextState: TSetStateInput<S>) => void];
type TCreateStateReturn = {
  reset: () => void;
  registerStateKey: <S>(
    initialState?: TStateInput<S> | undefined,
    onUpdate?: (() => void) | undefined
  ) => () => TStateHandlerReturn<S>;
};
export { createState, TState, TStateHandlerReturn };
