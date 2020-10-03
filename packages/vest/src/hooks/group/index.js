import { throwError } from '../../../../n4s/src/lib';
import context from '../../core/context';
import { isGroupExcluded } from '../exclusive';

/**
 * Registers a group in state.
 * @param {string} groupName
 */
const registerGroup = groupName => {
  const { stateRef } = context.use();
  stateRef.patch(state => {
    const nextState = { ...state };
    nextState.groups[groupName] = state.groups[groupName] || {};
    return nextState;
  });
};

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

  const { stateRef } = context.use();
  const state = stateRef.current();

  if (!isGroupExcluded(state, groupName)) {
    registerGroup(groupName);
  }

  context.run(
    {
      groupName,
    },
    () => tests()
  );
};

export default group;
