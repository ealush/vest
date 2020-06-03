import { extendRules } from '../lib';
import equals from './equals';
import greaterThan from './greaterThan';
import greaterThanOrEquals from './greaterThanOrEquals';
import inside from './inside';
import isArray from './isArray';
import isEmpty from './isEmpty';
import isEven from './isEven';
import isNumber from './isNumber';
import isNumeric from './isNumeric';
import isOdd from './isOdd';
import isString from './isString';
import isTruthy from './isTruthy';
import lengthEquals from './lengthEquals';
import lessThan from './lessThan';
import lessThanOrEquals from './lessThanOrEquals';
import longerThan from './longerThan';
import longerThanOrEquals from './longerThanOrEquals';
import matches from './matches';
import numberEquals from './numberEquals';
import shorterThan from './shorterThan';
import shorterThanOrEquals from './shorterThanOrEquals';

const rules = {
  equals,
  greaterThan,
  greaterThanOrEquals,
  inside,
  isArray,
  isEmpty,
  isEven,
  isNumber,
  isNumeric,
  isOdd,
  isString,
  isTruthy,
  lengthEquals,
  lessThan,
  lessThanOrEquals,
  longerThan,
  longerThanOrEquals,
  matches,
  numberEquals,
  shorterThan,
  shorterThanOrEquals,
};

export default extendRules(rules);
