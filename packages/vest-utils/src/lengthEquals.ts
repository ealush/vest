import bindNot from 'bindNot';
import { numberEquals } from 'numberEquals';

export function lengthEquals(
  value: string | unknown[],
  arg1: string | number
): boolean {
  return numberEquals(value.length, arg1);
}

export const lengthNotEquals = bindNot(lengthEquals);
