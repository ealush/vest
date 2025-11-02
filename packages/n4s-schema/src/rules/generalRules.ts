import { RuleInstance } from 'enforceUtil';

// Common type for rules that accept any value
export interface AnyRuleInstance extends RuleInstance<any, [any]> {}

export { condition } from 'condition';
export type { ConditionRuleInstance } from 'condition';

export { isEmpty } from 'isEmpty';
export { isFalsy } from 'isFalsy';
export { isNaN } from 'isNaN';
export type { NaNRuleInstance } from 'isNaN';
export { isNotArray } from 'isNotArray';
export { isNotBoolean } from 'isNotBoolean';
export { isNotEmpty } from 'isNotEmpty';
export { isNotNaN } from 'isNotNaN';
export { isNotNumber } from 'isNotNumber';
export { isNotNumeric } from 'isNotNumeric';
export { isNotString } from 'isNotString';
export { isTruthy } from 'isTruthy';
