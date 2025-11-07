import { type DropFirst } from 'vest-utils';
import { greaterThan, numberEquals } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { isNumeric } from 'isNumeric';
import { isBetween } from 'isBetween';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isEven } from 'isEven';
import { isNegative } from 'isNegative';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { isNotBetween } from 'isNotBetween';
import { numberNotEquals } from 'numberNotEquals';
import { isNaN } from 'isNaN';
import { isNotNaN } from 'isNotNaN';

export {
  isNumeric,
  greaterThan,
  numberEquals,
  isBetween,
  greaterThanOrEquals,
  isEven,
  isNegative,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  isNotBetween,
  numberNotEquals,
  isNaN,
  isNotNaN,
};

export interface NumericRuleInstance
  extends RuleInstance<string | number, [string | number]> {
  isBetween(
    ...args: DropFirst<Parameters<typeof isBetween>>
  ): NumericRuleInstance;
  greaterThan(
    ...args: DropFirst<Parameters<typeof greaterThan>>
  ): NumericRuleInstance;
  greaterThanOrEquals(
    ...args: DropFirst<Parameters<typeof greaterThanOrEquals>>
  ): NumericRuleInstance;
  lessThan(
    ...args: DropFirst<Parameters<typeof lessThan>>
  ): NumericRuleInstance;
  lessThanOrEquals(
    ...args: DropFirst<Parameters<typeof lessThanOrEquals>>
  ): NumericRuleInstance;
  isEven(...args: DropFirst<Parameters<typeof isEven>>): NumericRuleInstance;
  isOdd(...args: DropFirst<Parameters<typeof isOdd>>): NumericRuleInstance;
  isPositive(
    ...args: DropFirst<Parameters<typeof isPositive>>
  ): NumericRuleInstance;
  isNegative(
    ...args: DropFirst<Parameters<typeof isNegative>>
  ): NumericRuleInstance;
  isNotBetween(
    ...args: DropFirst<Parameters<typeof isNotBetween>>
  ): NumericRuleInstance;
  numberEquals(
    ...args: DropFirst<Parameters<typeof numberEquals>>
  ): NumericRuleInstance;
  numberNotEquals(
    ...args: DropFirst<Parameters<typeof numberNotEquals>>
  ): NumericRuleInstance;
  isNaN(...args: DropFirst<Parameters<typeof isNaN>>): NumericRuleInstance;
  isNotNaN(
    ...args: DropFirst<Parameters<typeof isNotNaN>>
  ): NumericRuleInstance;
  isNumeric(
    ...args: DropFirst<Parameters<typeof isNumeric>>
  ): NumericRuleInstance;
}
