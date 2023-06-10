import bindNot from 'bindNot';
import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';
import { Nullish } from 'utilityTypes';

export function isNullish(value: any): value is Nullish {
  return isNull(value) || isUndefined(value);
}

export const isNotNullish = bindNot(isNullish);
