import { type DropFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { equals } from 'equals';
import { isFalsy } from 'isFalsy';
import { isFalse } from 'isFalse';
import { isTrue } from 'isTrue';
import { isTruthy } from 'isTruthy';
import { isBoolean } from 'isBoolean';

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
