import { RuleInstance } from 'RuleInstance';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {}

export interface KeyOfRuleInstance
  extends RuleInstance<string | number | symbol, [string | number | symbol]> {}

export interface ValueOfRuleInstance<T> extends RuleInstance<T, [T]> {}

export type ObjectRulesUnion =
  | ObjectRuleInstance
  | KeyOfRuleInstance
  | ValueOfRuleInstance<any>;

export { isKeyOf, isNotKeyOf } from 'isKeyOf';

export { isValueOf, isNotValueOf } from 'isValueOf';
