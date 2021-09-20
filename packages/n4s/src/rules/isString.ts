import bindNot from 'bindNot';
import { isStringValue as isString } from 'isStringValue';

export const isNotString = bindNot(isString);
export { isString };
