import { extendRules } from '../lib';
import endsWith from './endsWith';
import equals from './equals';
import greaterThan from './greaterThan';
import greaterThanOrEquals from './greaterThanOrEquals';
import inside from './inside';
import isArray from './isArray';
import isBetween from './isBetween'
import isEmpty from './isEmpty';
import isEven from './isEven';
import isNaN from './isNaN';
import isNull from './isNull';
import isNumber from './isNumber';
import isNumeric from './isNumeric';
import isOdd from './isOdd';
import isString from './isString';
import isTruthy from './isTruthy';
import isUndefined from './isUndefined';
import lengthEquals from './lengthEquals';
import lessThan from './lessThan';
import lessThanOrEquals from './lessThanOrEquals';
import longerThan from './longerThan';
import longerThanOrEquals from './longerThanOrEquals';
import matches from './matches';
import numberEquals from './numberEquals';
import shorterThan from './shorterThan';
import shorterThanOrEquals from './shorterThanOrEquals';
import startsWith from './startsWith';

const rules = {
  endsWith,
  equals,
  greaterThan,
  greaterThanOrEquals,
  inside,
  isArray,
  isBetween,
  isEmpty,
  isEven,
  isNaN,
  isNull,
  isNumber,
  isNumeric,
  isOdd,
  isString,
  isTruthy,
  isUndefined,
  lengthEquals,
  lessThan,
  lessThanOrEquals,
  longerThan,
  longerThanOrEquals,
  matches,
  numberEquals,
  shorterThan,
  shorterThanOrEquals,
  startsWith
};

export default extendRules(rules);
