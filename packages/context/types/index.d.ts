declare function createContext<T extends Record<string, any>>(
  init?: (ctxRef: T, parentContext: T | void) => T | null
): {
  run: (ctxRef: T, fn: (context: T) => any) => any;
  bind: (
    ctxRef: T,
    fn: (...args: any[]) => any,
    ...args: any[]
  ) => (...runTimeArgs: any[]) => any;
  use: () => T | undefined;
};
export { createContext as default };
//# sourceMappingURL=index.d.ts.map
