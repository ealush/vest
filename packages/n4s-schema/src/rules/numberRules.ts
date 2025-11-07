import { type DropFirst } from 'vest-utils';
import { greaterThan, numberEquals } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { isBetween } from 'isBetween';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isEven } from 'isEven';
import { isNegative } from 'isNegative';
import { isNumber } from 'isNumber';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { isNotBetween } from 'isNotBetween';
import { numberNotEquals } from 'numberNotEquals';
import { isNaN } from 'isNaN';
import { isNotNaN } from 'isNotNaN';

export {
  greaterThan,
  numberEquals,
  isBetween,
  greaterThanOrEquals,
  isEven,
  isNegative,
  isNumber,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  isNotBetween,
  numberNotEquals,
  isNaN,
  isNotNaN,
};

export interface NumberRuleInstance extends RuleInstance<number, [number]> {
  isBetween(
    ...args: DropFirst<Parameters<typeof isBetween>>
  ): NumberRuleInstance;
  greaterThan(
    ...args: DropFirst<Parameters<typeof greaterThan>>
  ): NumberRuleInstance;
  greaterThanOrEquals(
    ...args: DropFirst<Parameters<typeof greaterThanOrEquals>>
  ): NumberRuleInstance;
  lessThan(...args: DropFirst<Parameters<typeof lessThan>>): NumberRuleInstance;
  lessThanOrEquals(
    ...args: DropFirst<Parameters<typeof lessThanOrEquals>>
  ): NumberRuleInstance;
  isEven(...args: DropFirst<Parameters<typeof isEven>>): NumberRuleInstance;
  isOdd(...args: DropFirst<Parameters<typeof isOdd>>): NumberRuleInstance;
  isPositive(
    ...args: DropFirst<Parameters<typeof isPositive>>
  ): NumberRuleInstance;
  isNegative(
    ...args: DropFirst<Parameters<typeof isNegative>>
  ): NumberRuleInstance;
  isNotBetween(
    ...args: DropFirst<Parameters<typeof isNotBetween>>
  ): NumberRuleInstance;
  numberEquals(
    ...args: DropFirst<Parameters<typeof numberEquals>>
  ): NumberRuleInstance;
  numberNotEquals(
    ...args: DropFirst<Parameters<typeof numberNotEquals>>
  ): NumberRuleInstance;
  isNumber(...args: DropFirst<Parameters<typeof isNumber>>): NumberRuleInstance;
  isNaN(...args: DropFirst<Parameters<typeof isNaN>>): NumberRuleInstance;
  isNotNaN(...args: DropFirst<Parameters<typeof isNotNaN>>): NumberRuleInstance;
}
