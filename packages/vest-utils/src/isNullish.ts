import bindNot from 'bindNot';
import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';

export function isNullish(value: any): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

export const isNotNullish = bindNot(isNullish);
