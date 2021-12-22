import isFunction from 'isFunction';
import { isStringValue } from 'isStringValue';
import throwError from 'throwError';

import { IsolateTypes } from 'IsolateTypes';
import context from 'ctx';
import { isolate } from 'isolate';

/**
 * Runs tests within a group so that they can be controlled or queried separately.
 *
 * @example
 *
 * group('group_name', () => {
 *  // Tests go here
 * });
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
