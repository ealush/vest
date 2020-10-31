import bindNot from 'bindNot';
import isString from 'isStringValue';

export function matches(value, regex) {
  if (regex instanceof RegExp) {
    return regex.test(value);
  } else if (isString(regex)) {
    return new RegExp(regex).test(value);
  } else {
    return false;
  }
}

export const notMatches = bindNot(matches);
