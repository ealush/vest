import { RuleInstance } from 'enforce';

export interface ObjectRuleInstance extends RuleInstance<object, [object]> {}

export { isKeyOf, isNotKeyOf } from 'isKeyOf';

export { isValueOf, isNotValueOf } from 'isValueOf';
