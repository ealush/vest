// Small shared type helpers
export type FirstArg<F> = F extends (arg: infer A, ...rest: any[]) => any
  ? A
  : never;
