import { isStringValue as isString, bindNot } from 'vest-utils';

export const isNotString = bindNot(isString);
export { isString };
