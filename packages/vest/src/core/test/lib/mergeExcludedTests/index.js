import { isExcluded } from '../../../../hooks/exclusive';
import patch from '../../../state/patch';

/**
 * Merges excluded tests with their prevState values.
 * @param {string} suiteId
 */
const mergeExcludedTests = suiteId => {
  patch(suiteId, (state, prevState) => {
    if (!prevState) {
      return state;
    }

    const nextState = { ...state };

    nextState.testObjects = nextState.testObjects.concat(
      prevState.testObjects.reduce((movedTests, testObject) => {
        // Checking prev-test object against current state;
        if (isExcluded(testObject)) {
          return movedTests.concat(testObject);
        }

        return movedTests;
      }, [])
    );

    return nextState;
  });
};

export default mergeExcludedTests;
