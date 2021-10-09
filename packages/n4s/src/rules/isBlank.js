import bindNot from 'bindNot';

export function isBlank(value) {
  return typeof value === 'string' && value.trim() === '';
}

export const isNotBlank = bindNot(isBlank);
