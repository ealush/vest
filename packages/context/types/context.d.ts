declare function createContext<T extends Record<string, unknown>>(init?: (ctxRef: Partial<T>, parentContext: T | void) => T | null): {
    run: <R>(ctxRef: Partial<T>, fn: (context: T) => R) => R;
    bind: <Fn extends (...args: any[]) => any>(ctxRef: Partial<T>, fn: Fn) => Fn;
    use: () => T | undefined;
    useX: (errorMessage?: string) => T;
};
export { createContext };
