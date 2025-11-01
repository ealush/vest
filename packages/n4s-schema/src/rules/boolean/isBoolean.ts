import { RuleInstance } from '../../enforce';
import { genRuleChain } from '../genRuleChain';

import { equals } from './equals';
import { isFalse } from './isFalse';
import { isTrue } from './isTrue';

function isTruthy(value: boolean): boolean {
  return !!value;
}

function isFalsy(value: boolean): boolean {
  return !value;
}

export interface BooleanRuleInstance extends RuleInstance<boolean, [boolean]> {
  isTrue(): BooleanRuleInstance;
  isFalse(): BooleanRuleInstance;
  isTruthy(): BooleanRuleInstance;
  isFalsy(): BooleanRuleInstance;
  equals(v: boolean): BooleanRuleInstance;
}
const rules = { equals, isFalse, isFalsy, isTrue, isTruthy };
function isBooleanPredicate(value: any): boolean {
  return typeof value === 'boolean';
}
export function isBoolean(): BooleanRuleInstance {
  const add = genRuleChain<BooleanRuleInstance>(rules);
  return add(isBooleanPredicate);
}
