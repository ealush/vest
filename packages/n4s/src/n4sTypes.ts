import { RuleRunReturn } from './utils/RuleRunReturn';
import type { FirstParam } from './eager/typeUtils';
import type { CB, DropFirst } from 'vest-utils';

/**
 * Global namespace for n4s custom rules.
 * Users should extend EnforceMatchers with value-first rule signatures.
 * These will be used to type both eager (value-first drop) and lazy (builder) APIs.
 *
 * Each rule is a function whose FIRST parameter is the value being validated.
 * The function should return a boolean or a RuleRunReturn<T>.
 *
 * Example:
 * declare global {
 *   namespace n4s {
 *     interface EnforceMatchers {
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
    interface EnforceMatchers {}
  }
}

export type EnforceMatchers = n4s.EnforceMatchers;
// Note: We don't augment RuleInstance here with mapped types, because TS disallows
// interfaces extending mapped/conditional types. Instead, eager.ts and lazy.ts
// each map n4s.EnforceMatchers into their respective APIs explicitly.

/**
 * Base type for mapping custom matcher functions.
 * Drops the first parameter (value) and maps remaining args.
 */
export type CustomMatcherArgs<K extends keyof n4s.EnforceMatchers> = DropFirst<
  Parameters<Extract<n4s.EnforceMatchers[K], CB>>
>;

export type EnforceCustomMatcher<F extends CB> = (
  ...args: CustomMatcherArgs<F extends keyof n4s.EnforceMatchers ? F : never>
) => boolean | RuleRunReturn<any>;

/**
 * Maps custom rules to eager API signatures (drops the value parameter).
 * Only includes rules where T matches the first parameter type.
 */
export type TCustomRules<T, A, S> = {
  [K in keyof n4s.EnforceMatchers as T extends FirstParam<
    n4s.EnforceMatchers[K]
  >
    ? K
    : never]: (
    ...args: CustomMatcherArgs<K>
  ) => import('./eager').EnforceEagerReturn<T, A, S>;
};
