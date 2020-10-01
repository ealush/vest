import context from '../../core/context';
import validateSuiteParams from '../../lib/validateSuiteParams';
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
  // TODO: Replace with something local
  validateSuiteParams('group', groupName, tests);

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
