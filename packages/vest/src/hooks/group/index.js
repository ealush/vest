import getSuiteState from '../../core/state/getSuiteState';
import patch from '../../core/state/patch';
import runWithContext from '../../lib/runWithContext';
import singleton from '../../lib/singleton';
import validateSuiteParams from '../../lib/validateSuiteParams';
import { isGroupExcluded } from '../exclusive';

/**
 * Registers a group in state.
 * @param {string} groupName
 */
const registerGroup = groupName => {
  const context = singleton.useContext();
  patch(context.suiteId, state => {
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

  const ctx = singleton.useContext();
  const state = getSuiteState(ctx.suiteId);

  if (!isGroupExcluded(state, groupName)) {
    registerGroup(groupName);
  }

  runWithContext(
    {
      groupName,
    },
    () => tests()
  );
};

export default group;
