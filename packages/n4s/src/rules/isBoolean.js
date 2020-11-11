import bindNot from 'bindNot';
import isBoolean from 'isBooleanValue';

export const isNotBoolean = bindNot(isBoolean);
export { isBoolean };
