import { isStringValue, invariant, isFunction } from 'vest-utils';

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
  invariant(isStringValue(groupName), groupErrorMsg('name must be a string'));

  invariant(isFunction(tests), groupErrorMsg('callback must be a function'));

  // Running with the context applied
  isolate({ type: IsolateTypes.GROUP }, () => {
    context.run({ groupName }, tests);
  });
}

function groupErrorMsg(error: string) {
  return `Wrong arguments passed to group. Group ${error}.`;
}
