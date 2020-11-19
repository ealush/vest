import context from 'ctx';
import isFunction from 'isFunction';
import isStringValue from 'isStringValue';
import throwError from 'throwError';

const throwGroupError = value =>
  throwError(
    __DEV__
      ? `group initialization error. Expected "${value}" to be a string.`
      : 'group name must be a string'
  );

/**
 * Runs a group callback.
 * @param {string} groupName
 * @param {Function} tests
 */
const group = (groupName, tests) => {
  if (!isStringValue(groupName)) {
    throwGroupError(groupName);
  }

  if (!isFunction(tests)) {
    throwGroupError(tests);
  }

  // Running with the context applied
  context.bind({ groupName }, tests)();
};

export default group;
