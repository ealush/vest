import { isExcluded } from '../../../../hooks/exclusive';
import useTestObjects from '../../../state/useTestObjects';

/**
 * Merges excluded tests with their prevState values.
 */
const mergeExcludedTests = prevState => {
  useTestObjects(state => {
    if (!Array.isArray(prevState) || !prevState.length) {
      return state;
    }

    state = state.concat(
      prevState.reduce((movedTests, testObject) => {
        // Checking prev-test object against current state;
        if (isExcluded(testObject)) {
          return movedTests.concat(testObject);
        }

        return movedTests;
      }, [])
    );

    return state;
  });
};

export default mergeExcludedTests;
