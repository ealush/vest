import context from 'ctx';
import isFunction from 'isFunction';
import isStringValue from 'isStringValue';
import throwError from 'throwError';

/**
 * Runs a group callback.
 * @param {string} groupName
 * @param {Function} tests
 */
const group = (groupName, tests) => {
  if (!isStringValue(groupName)) {
    throwError(
      `group initialization error. Expected "${groupName}" to be a string.`
    );
  }

  if (!isFunction(tests)) {
    throwError(
      `group initialization error. Expected "${tests}" to be a function.`
    );
  }

  // Running with the context applied
  context.bind({ groupName }, tests)();
};

export default group;
