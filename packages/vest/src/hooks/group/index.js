import context from '../../core/context';
import getState from '../../core/suite/getState';
import patch from '../../core/suite/patch';
import validateSuiteParams from '../../lib/validateSuiteParams';
import { isGroupExcluded } from '../exclusive';

/**
 * Registers a group in state.
 * @param {string} groupName
 */
const registerGroup = groupName => {
  const ctx = context.use();
  patch(ctx.suiteId, state => {
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
  validateSuiteParams('group', groupName, tests);

  const ctx = context.use();
  const state = getState(ctx.suiteId);

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
