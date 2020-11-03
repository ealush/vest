import bindNot from 'bindNot';

export function lengthEquals(value, arg1) {
  return value.length === Number(arg1);
}

export const lengthNotEquals = bindNot(lengthEquals);
