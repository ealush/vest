import context from 'ctx';
import isFunction from 'isFunction';
import isStringValue from 'isStringValue';
import throwError from 'throwError';

const throwGroupError = () =>
  throwError(
      "group initialization error. Incompatible argument passed to group."
  );

/**
 * Runs a group callback.
 * @param {string} groupName
 * @param {Function} tests
 */
const group = (groupName, tests) => {
  if (!isStringValue(groupName)) {
    throwGroupError();
  }

  if (!isFunction(tests)) {
    throwGroupError();
  }

  // Running with the context applied
  context.bind({ groupName }, tests)();
};

export default group;
