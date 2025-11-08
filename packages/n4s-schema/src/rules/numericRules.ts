import { equals } from 'equals';
import { isNaN } from 'isNaN';
import { isNegative } from 'isNegative';
import { type DropFirst } from 'vest-utils';
import { greaterThan, numberEquals } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isBetween } from 'isBetween';
import { isEven } from 'isEven';
import { isNotBetween } from 'isNotBetween';
import { isNotNaN } from 'isNotNaN';
import { isNumeric } from 'isNumeric';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { numberNotEquals } from 'numberNotEquals';

export {
  equals,
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
  equals(
    ...args: DropFirst<Parameters<typeof equals<string | number>>>
  ): NumericRuleInstance;
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
