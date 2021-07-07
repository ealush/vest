import bindNot from 'bindNot';

export function isBlank(value: unknown): boolean {
  return typeof value === 'string' && value.trim() === '';
}

export const isNotBlank = bindNot(isBlank);
