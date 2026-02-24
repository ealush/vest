import { greaterThan, numberEquals } from 'vest-utils';

import { BuildRuleInstance, ExtractRuleFunctions } from './RuleInstanceBuilder';
import { equals } from './general/equals';
import { isNaN } from './general/isNaN';
import { isNotNaN } from './general/isNotNaN';
import { greaterThanOrEquals } from './number/greaterThanOrEquals';
import { isBetween } from './number/isBetween';
import { isEven } from './number/isEven';
import { isNegative } from './number/isNegative';
import { isNotBetween } from './number/isNotBetween';
import { isNumber } from './number/isNumber';
import { isOdd } from './number/isOdd';
import { isPositive } from './number/isPositive';
import { lessThan } from './number/lessThan';
import { lessThanOrEquals } from './number/lessThanOrEquals';
import { toNumber } from './numeric/toNumber';
import { numberNotEquals } from './number/numberNotEquals';

const gt = greaterThan;
const gte = greaterThanOrEquals;
const lt = lessThan;
const lte = lessThanOrEquals;
const eq = equals;
const neq = numberNotEquals;

const aliases = {
  eq,
  gt,
  gte,
  lt,
  lte,
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
  toNumber,
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
  toNumber,
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
