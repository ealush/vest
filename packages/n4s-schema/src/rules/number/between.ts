import { between as betweenBase } from '../commonNumeric';

export function between(value: number, min: number, max: number): boolean {
  return betweenBase(value, min, max);
}
