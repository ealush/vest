import bindNot from 'bindNot';
import isString from 'isStringValue';

export const isNotString = bindNot(isString);
export { isString };
