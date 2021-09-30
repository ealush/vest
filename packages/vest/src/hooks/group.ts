import isFunction from 'isFunction';
import { isStringValue } from 'isStringValue';
import throwError from 'throwError';

import context from 'ctx';

/**
 * Runs a group callback.
 */
export default function group(groupName: string, tests: () => any): void {
  if (!isStringValue(groupName)) {
    throwGroupError('name must be a string');
  }

  if (!isFunction(tests)) {
    throwGroupError('callback must be a function');
  }

  // Running with the context applied
  context.run({ groupName }, tests);
}

function throwGroupError(error: string) {
  throwError(`Wrong arguments passed to group. Group ${error}.`);
}
