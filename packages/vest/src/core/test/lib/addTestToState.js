import useTestObjects from 'useTestObjects';

/**
 * Stores test object inside suite state.
 * @param {VestTest} testObject
 */
export default testObject => {
  useTestObjects(testObjects => testObjects.concat(testObject));
};
