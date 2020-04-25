import singleton from '../../../../lib/singleton';

/**
 * Sets current test in context, and runs the test.
 * @param {VestTest} testObject
 * @param {Function} [cb]
 * @returns {*} test output
 */
const runTest = (testObject, cb) => {
  if (typeof cb !== 'function') {
    return;
  }

  const context = singleton.useContext();

  context.setCurrentTest(testObject);
  const res = cb();
  context.removeCurrentTest();

  return res;
};

export default runTest;
