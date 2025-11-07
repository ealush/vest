import { RuleInstance } from 'RuleInstance';

// Backward-compatible re-exports to avoid breaking existing imports
export { isNull } from 'isNull';

export { isUndefined } from 'isUndefined';

export { isNullish } from 'isNullish';

export interface NullRuleInstance extends RuleInstance<null, [null]> {}

export interface UndefinedRuleInstance
  extends RuleInstance<undefined, [undefined]> {}

export interface NullishRuleInstance
  extends RuleInstance<null | undefined, [null | undefined]> {}
