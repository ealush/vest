/**
 * Module: `src/rules/nullishRules.ts`.
 *
 * Provides `nullishRules`-related runtime and type utilities used by `n4s`.
 */
import { RuleInstance } from '../utils/RuleInstance';

// Backward-compatible re-exports to avoid breaking existing imports
export { isNull } from './nullish/isNull';

export { isUndefined } from './nullish/isUndefined';

export { isNullish } from './nullish/isNullish';

export interface NullRuleInstance extends RuleInstance<null, [null]> {}

export interface UndefinedRuleInstance extends RuleInstance<
  undefined,
  [undefined]
> {}

export interface NullishRuleInstance extends RuleInstance<
  null | undefined,
  [null | undefined]
> {}
