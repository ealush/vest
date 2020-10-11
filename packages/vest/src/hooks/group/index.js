import { throwError } from '../../../../n4s/src/lib';
import context from '../../core/context';

/**
 * Runs a group callback.
 * @param {string} groupName
 * @param {Function} tests
 */
const group = (groupName, tests) => {
  if (typeof groupName !== 'string') {
    throwError(
      `group initialization error. Expected "${groupName}" to be a string.`
    );
  }

  if (typeof tests !== 'function') {
    throwError(
      `group initialization error. Expected "${tests}" to be a function.`
    );
  }

  // Running with the context applied
  context.bind({ groupName }, tests)();
};

export default group;
