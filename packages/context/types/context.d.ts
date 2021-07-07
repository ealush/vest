declare function createContext<T extends Record<string, unknown>>(init?: (ctxRef: T, parentContext: T | void) => T | null): {
    run: <R>(ctxRef: T, fn: (context: T) => R) => R;
    bind: <Fn extends (...args: any[]) => any>(ctxRef: T, fn: Fn) => Fn;
    use: () => T | undefined;
};
export { createContext as default };
//# sourceMappingURL=context.d.ts.map