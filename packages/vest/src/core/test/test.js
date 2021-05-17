import VestTest from 'VestTest';
import context from 'ctx';
import { isExcluded } from 'exclusive';
import isFunction from 'isFunction';
import mergeCarryOverTests from 'mergeCarryOverTests';
import registerTest from 'registerTest';
import { useSkippedTests } from 'stateHooks';
import bindTestEach from 'test.each';
import bindTestMemo from 'test.memo';
import withArgs from 'withArgs';

/**
 * Test function used by consumer to provide their own validations.
 * @param {String} fieldName            Name of the field to test.
 * @param {String} [statement]          The message returned in case of a failure.
 * @param {function} testFn             The actual test callback.
 * @return {VestTest}                 A VestTest instance.
 *
 * **IMPORTANT**
 * Changes to this function need to reflect in test.memo as well
 */
const test = withArgs(function (fieldName, args) {
  const [testFn, statement] = args.reverse();
  const [, setSkippedTests] = useSkippedTests();

  const { groupName } = context.use();
  const testObject = VestTest({
    fieldName,
    group: groupName,
    statement,
    testFn,
  });

  if (isExcluded(testObject)) {
    setSkippedTests(skippedTests => skippedTests.concat(testObject));
    mergeCarryOverTests(testObject);
    return testObject;
  }

  if (!isFunction(testFn)) {
    return testObject;
  }

  registerTest(testObject);

  return testObject;
});

bindTestEach(test);
bindTestMemo(test);

export default test;
