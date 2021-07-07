import isString from 'isStringValue';

import bindNot from 'bindNot';

export const isNotString = bindNot(isString);
export { isString };
