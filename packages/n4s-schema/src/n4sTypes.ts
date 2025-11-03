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
// Note: We don't augment RuleInstance here with mapped types, because TS disallows
// interfaces extending mapped/conditional types. Instead, eager.ts and lazy.ts
// each map n4s.ValueFirstRules into their respective APIs explicitly.
