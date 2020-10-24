import bindNot from 'bindNot';

export function endsWith(value, arg1) {
  return (
    typeof value === 'string' &&
    typeof arg1 === 'string' &&
    value.endsWith(arg1)
  );
}

export const doesNotEndWith = bindNot(endsWith);
