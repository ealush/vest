import { isExcluded } from '../../../../hooks/exclusive';
import useTestObjects from '../../../state/useTestObjects';

/**
 * Merges excluded tests with their prevState values.
 */
const mergeExcludedTests = (prevState = []) => {
  useTestObjects(state =>
    state.concat(
      prevState.reduce((movedTests, testObject) => {
        // Checking prev-test object against current state;
        if (isExcluded(testObject)) {
          return movedTests.concat(testObject);
        }

        return movedTests;
      }, [])
    )
  );
};

export default mergeExcludedTests;
