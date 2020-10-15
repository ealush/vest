import { bindNot } from '../../lib';

export function startsWith(value, arg1) {
  return (
    typeof value === 'string' &&
    typeof arg1 === 'string' &&
    value.startsWith(arg1)
  );
}

export const doesNotStartWith = bindNot(startsWith);
