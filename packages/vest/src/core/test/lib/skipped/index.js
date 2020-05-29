import patch from '../../../state/patch';

/**
 * Sets a field as skipped.
 * @param {string} suiteId
 * @param {string} fieldName
 */
export const setSkippedTest = (suiteId, fieldName) => {
  patch(suiteId, state => {
    if (state.skippedTests[fieldName]) {
      return state;
    }
    const nextState = { ...state };
    nextState.skippedTests[fieldName] = true;
    return nextState;
  });
};

/**
 * Sets a group as skipped.
 * @param {string} suiteId
 * @param {string} groupName
 */
export const setSkippedGroup = (suiteId, groupName) => {
  patch(suiteId, state => {
    if (state.skippedGroups[groupName]) {
      return state;
    }
    const nextState = { ...state };
    nextState.skippedGroups[groupName] = true;
    return nextState;
  });
};

/**
 * Merges skipped items with their prevState values.
 * @param {string} suiteId
 */
export const mergeSkipped = suiteId => {
  patch(suiteId, (state, prevState) => {
    if (!prevState) {
      return state;
    }

    const nextState = { ...state };

    for (const fieldName in state.skippedTests) {
      if (prevState.tests[fieldName] && !state.tests[fieldName]) {
        nextState.tests[fieldName] = { ...prevState.tests[fieldName] };
        nextState.errorCount += prevState.tests[fieldName].errorCount;
        nextState.warnCount += prevState.tests[fieldName].warnCount;
      }
    }

    for (const groupName in state.skippedGroups) {
      for (const group in prevState.groups) {
        if (group === groupName) {
          nextState.groups[group] = prevState.groups[group];
        }
      }
    }

    return nextState;
  });
};
