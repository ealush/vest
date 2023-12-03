import { isNullish } from 'isNullish';

export function isObject(v: any): v is Record<any, any> {
  return typeof v === 'object' && !isNullish(v);
}