import { greaterThan, numberEquals } from 'vest-utils';

import { BuildRuleInstance, ExtractRuleFunctions } from 'RuleInstanceBuilder';
import { equals } from 'equals';
import { greaterThanOrEquals } from 'greaterThanOrEquals';
import { isBetween } from 'isBetween';
import { isEven } from 'isEven';
import { isNaN } from 'isNaN';
import { isNegative } from 'isNegative';
import { isNotBetween } from 'isNotBetween';
import { isNotNaN } from 'isNotNaN';
import { isNumber } from 'isNumber';
import { isOdd } from 'isOdd';
import { isPositive } from 'isPositive';
import { lessThan } from 'lessThan';
import { lessThanOrEquals } from 'lessThanOrEquals';
import { numberNotEquals } from 'numberNotEquals';

const gt = greaterThan;
const gte = greaterThanOrEquals;
const lt = lessThan;
const lte = lessThanOrEquals;
const eq = equals;
const neq = numberNotEquals;

const aliases = {
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
};

export {
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
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
  ...aliases,
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

export type NumericRuleInstance = BuildRuleInstance<
  string | number,
  [string | number],
  ExtractRuleFunctions<typeof numberRules>
>;
