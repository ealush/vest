import bindNot from 'bindNot';

export function matches(value, regex) {
  if (regex instanceof RegExp) {
    return regex.test(value);
  } else if (typeof regex === 'string') {
    return new RegExp(regex).test(value);
  } else {
    return false;
  }
}

export const notMatches = bindNot(matches);
