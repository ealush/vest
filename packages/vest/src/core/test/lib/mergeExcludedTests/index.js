import { isExcluded } from '../../../../hooks/exclusive';
import context from '../../../context';

/**
 * Merges excluded tests with their prevState values.
 */
const mergeExcludedTests = () => {
  const { stateRef } = context.use();
  stateRef.patch((state, prevState) => {
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
