<<<<<<< HEAD
declare function createState(
  onStateChange?: (...args: unknown[]) => unknown
): TCreateStateReturn;
type TStateInput<S> = S | (() => S);
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
export { createState as default, TState, TStateHandlerReturn };
=======
type TStateInput<S> = S | (() => S);
type TSetStateInput<S> = S | ((prevState: S) => S);
type TStateHandlerReturn<S> = [S, (nextState: TSetStateInput<S>) => void];
type TCreateStateReturn = {
    reset: () => void;
    registerStateKey: <S>(initialState?: TStateInput<S> | undefined, onUpdate?: (() => void) | undefined) => () => TStateHandlerReturn<S>;
};
declare function createState(onStateChange?: (...args: unknown[]) => unknown): TCreateStateReturn;
export { createState as default };
//# sourceMappingURL=vast.d.ts.map
>>>>>>> 49b6b84 (Vest 4 Infra Setup)
