import { BuildRuleInstance, ExtractRuleFunctions } from 'RuleInstanceBuilder';
import { equals } from 'equals';
import { isNaN } from 'isNaN';
import { isNegative } from 'isNegative';
import { isNumber } from 'isNumber';
import { greaterThan, numberEquals } from 'vest-utils';

import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isBetween } from 'isBetween';
import { isEven } from 'isEven';
import { isNotBetween } from 'isNotBetween';
import { isNotNaN } from 'isNotNaN';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { numberNotEquals } from 'numberNotEquals';

export {
  equals,
  greaterThan,
  greaterThanOrEquals,
  isBetween,
  isEven,
  isNaN,
  isNegative,
  isNotBetween,
  isNotNaN,
  isNumber,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  numberEquals,
  numberNotEquals,
};

const numberRules = {
  equals,
  greaterThan,
  greaterThanOrEquals,
  isBetween,
  isEven,
  isNaN,
  isNegative,
  isNotBetween,
  isNotNaN,
  isNumber,
  isOdd,
  isPositive,
  lessThan,
  lessThanOrEquals,
  numberEquals,
  numberNotEquals,
} as const;

export type NumberRuleInstance = BuildRuleInstance<
  number,
  [number],
  ExtractRuleFunctions<typeof numberRules>
>;
