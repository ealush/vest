import { bindNot } from '../../lib';

export function endsWith(value, arg1) {
  return (
    typeof value === 'string' &&
    typeof arg1 === 'string' &&
    value.endsWith(arg1)
  );
}

export const doesNotEndWith = bindNot(endsWith);
