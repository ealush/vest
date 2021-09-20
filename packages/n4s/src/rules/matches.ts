import bindNot from 'bindNot';
import { isStringValue as isString } from 'isStringValue';

export function matches(value: string, regex: RegExp | string): boolean {
  if (regex instanceof RegExp) {
    return regex.test(value);
  } else if (isString(regex)) {
    return new RegExp(regex).test(value);
  } else {
    return false;
  }
}

export const notMatches = bindNot(matches);
