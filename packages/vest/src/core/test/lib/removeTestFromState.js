import asArray from 'asArray';
import removeElementFromArray from 'removeElementFromArray';
import useTestObjects from 'useTestObjects';

/**
 * Removes test object from suite state
 * @param {VestTest} testObject
 */
export default testObject => {
  useTestObjects(testObjects =>
    // using asArray to clear the cache.
    asArray(removeElementFromArray(testObjects, testObject))
  );
};
