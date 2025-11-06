import { RuleInstance } from 'RuleInstance';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {}

export { isKeyOf, isNotKeyOf } from 'isKeyOf';

export { isValueOf, isNotValueOf } from 'isValueOf';
