import isFunction from 'isFunction';
import isStringValue from 'isStringValue';
import throwError from 'throwError';

import context from 'ctx';

/**
 * Runs a group callback.
 */
export default function group(groupName: string, tests: () => any): void {
  if (!isStringValue(groupName)) {
    throwGroupError();
  }

  if (!isFunction(tests)) {
    throwGroupError();
  }

  // Running with the context applied
  context.bind({ groupName }, tests)();
}

function throwGroupError(value: unknown) {
  throwError(
    __DEV__
      ? `group initialization error. Expected "${value}" to be a string.`
      : 'group name must be a string'
  );
}
