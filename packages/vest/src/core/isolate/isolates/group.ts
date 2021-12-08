import isFunction from 'isFunction';
import { isStringValue } from 'isStringValue';
import throwError from 'throwError';

import { IsolateTypes } from 'IsolateTypes';
import context from 'ctx';
import { isolate } from 'isolate';

/**
 * Runs a group callback.
 */
export default function group(groupName: string, tests: () => void): void {
  if (!isStringValue(groupName)) {
    throwGroupError('name must be a string');
  }

  if (!isFunction(tests)) {
    throwGroupError('callback must be a function');
  }

  // Running with the context applied
  isolate({ type: IsolateTypes.GROUP }, () => {
    context.run({ groupName }, tests);
  });
}

function throwGroupError(error: string) {
  throwError(`Wrong arguments passed to group. Group ${error}.`);
}
