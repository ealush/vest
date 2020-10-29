import bindNot from 'bindNot';

export function isNumeric(value) {
  const result =
    !isNaN(parseFloat(value)) && !isNaN(Number(value)) && isFinite(value);
  return Boolean(result);
}

export const isNotNumeric = bindNot(isNumeric);
