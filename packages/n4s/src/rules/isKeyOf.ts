import bindNot from 'bindNot';
import { isBoolean } from 'isBooleanValue';
import { isNullish } from 'isNullish';
import { isStringValue } from 'isStringValue';

export function isKeyOf(key: string | symbol | number, obj: any): boolean {
  const shouldTerminate =
    isNullish(obj) || isBoolean(obj) || isStringValue(obj);

  return shouldTerminate ? false : key in obj;
}

export const isNotKeyOf = bindNot(isKeyOf);
