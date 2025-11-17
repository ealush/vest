import { RuleInstance } from '../utils/RuleInstance';

// Common type for rules that accept any value
export interface AnyRuleInstance extends RuleInstance<any, [any]> {}

export { condition } from './general/condition';
export { equals } from './general/equals';
export { notEquals } from './general/notEquals';
export { isEmpty } from './general/isEmpty';
export { isFalsy } from './general/isFalsy';
export { isNaN } from './general/isNaN';
export type { NaNRuleInstance } from './general/isNaN';
export { isNotArray } from './general/isNotArray';
export { isNotBoolean } from './general/isNotBoolean';
export { isNotEmpty } from './general/isNotEmpty';
export { isNotNaN } from './general/isNotNaN';
export { isNotNumber } from './general/isNotNumber';
export { isNotNumeric } from './general/isNotNumeric';
export { isNotString } from './general/isNotString';
export { isTruthy } from './general/isTruthy';
export { isNotNull } from './general/isNotNull';
export { isNotUndefined } from './general/isNotUndefined';
export { isNotNullish } from './general/isNotNullish';
export { isBlank } from './general/isBlank';
export { isNotBlank } from './general/isBlank';
