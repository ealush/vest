import bindNot from 'bindNot';

export function lengthEquals(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return value.length === Number(arg1);
}

export const lengthNotEquals = bindNot(lengthEquals);
