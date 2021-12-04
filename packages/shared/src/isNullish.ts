import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';

export default function isNullish(value: any): value is null | undefined {
  return isNull(value) || isUndefined(value);
}
