import bindNot from 'bindNot';

export function lengthEquals(value, arg1) {
  return value.length === arg1;
}

export const lengthNotEquals = bindNot(lengthEquals);
