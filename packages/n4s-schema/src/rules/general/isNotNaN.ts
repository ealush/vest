import { toNumber } from 'toNumber';

export function isNotNaN(value: any): boolean {
  return !Number.isNaN(toNumber(value));
}
