import { type DropFirst } from 'vest-utils';

import { RuleInstance } from '../utils/RuleInstance';

import { isBoolean } from './boolean/isBoolean';
import { isFalse } from './boolean/isFalse';
import { isTrue } from './boolean/isTrue';
import { equals } from './general/equals';
import { isFalsy } from './general/isFalsy';
import { isTruthy } from './general/isTruthy';

export { equals, isFalsy, isFalse, isTrue, isTruthy, isBoolean };

export interface BooleanRuleInstance extends RuleInstance<boolean, [boolean]> {
  isTrue(...args: DropFirst<Parameters<typeof isTrue>>): BooleanRuleInstance;
  isFalse(...args: DropFirst<Parameters<typeof isFalse>>): BooleanRuleInstance;
  isTruthy(
    ...args: DropFirst<Parameters<typeof isTruthy>>
  ): BooleanRuleInstance;
  isFalsy(...args: DropFirst<Parameters<typeof isFalsy>>): BooleanRuleInstance;
  equals(...args: DropFirst<Parameters<typeof equals>>): BooleanRuleInstance;
  isBoolean(
    ...args: DropFirst<Parameters<typeof isBoolean>>
  ): BooleanRuleInstance;
}
