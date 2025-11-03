import type { DropFirst } from 'vest-utils';
/**
 * Global namespace for n4s custom rules.
 * Users should extend ValueFirstRules with value-first rule signatures.
 * These will be used to type both eager (value-first drop) and lazy (builder) APIs.
 *
 * Each rule is a function whose FIRST parameter is the value being validated.
 * The function should return a boolean or a RuleRunReturn<T>.
 *
 * Example:
 * declare global {
 *   namespace n4s {
 *     interface ValueFirstRules {
 *       isPositive: (value: number) => boolean;
 *       isBetween: (value: number, min: number, max: number) => boolean;
 *     }
 *   }
 * }
 */
/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface */
declare global {
  namespace n4s {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ValueFirstRules {}
  }
}

export type ValueFirstRules = n4s.ValueFirstRules;

// Augment RuleInstance to include custom lazy rule methods based on first arg

type FirstArg<F> = F extends (arg: infer A, ...rest: any[]) => any ? A : never;

declare module 'enforceUtil' {
  // map custom rule names to methods available on RuleInstance when T matches
  type CustomRuleMethods<T, Args extends any[] = any[]> = {
    [K in keyof n4s.ValueFirstRules as FirstArg<
      n4s.ValueFirstRules[K]
    > extends T
      ? K
      : never]: (
      ...args: DropFirst<
        Parameters<Extract<n4s.ValueFirstRules[K], (...args: any) => any>>
      >
    ) => RuleInstance<T, Args>;
  };

  interface RuleInstance<T, Args extends any[] = any[]>
    extends CustomRuleMethods<T, Args> {}
}
