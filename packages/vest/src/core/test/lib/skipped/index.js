import patch from '../../../state/patch';

/**
 * Sets a field as skipped.
 * @param {string} suiteId
 * @param {string} fieldName
 */
export const setSkipped = (suiteId, fieldName) => {
  patch(suiteId, state => {
    if (state.skipped[fieldName]) {
      return state;
    }
    const nextState = { ...state };
    nextState.skipped[fieldName] = true;
    return nextState;
  });
};

/**
 * Merges prevState fields with skipped currentState fields.
 * @param {string} suiteId
 */
export const mergeSkipped = suiteId => {
  patch(suiteId, (state, prevState) => {
    if (!prevState) {
      return state;
    }

    const nextState = { ...state };
    for (const fieldName in state.skipped) {
      if (prevState.tests[fieldName] && !state.tests[fieldName]) {
        nextState.tests[fieldName] = { ...prevState.tests[fieldName] };
        nextState.errorCount += prevState.tests[fieldName].errorCount;
        nextState.warnCount += prevState.tests[fieldName].warnCount;
      }
    }

    return nextState;
  });
};
