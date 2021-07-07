import isBoolean from 'isBooleanValue';

import bindNot from 'bindNot';

export const isNotBoolean = bindNot(isBoolean);
export { isBoolean };
