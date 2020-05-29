import { isExcluded } from '../../hooks/exclusive';
import singleton from '../../lib/singleton';
import patch from '../state/patch';
import VestTest from './lib/VestTest';
import { setPending } from './lib/pending';
import runTest from './lib/runTest';
import { setSkippedTest } from './lib/skipped';

const BASE_COUNTERS = {
  errorCount: 0,
  warnCount: 0,
};

/**
 * Initiates a field in the suite state.
 * @param {string} suiteId.
 * @param {string} fieldName.
 */
const initField = (suiteId, fieldName) => {
  patch(suiteId, state => {
    if (state.tests[fieldName] !== undefined) {
      return state;
    }

    return {
      ...state,
      tests: {
        ...state.tests,
        [fieldName]: {
          ...BASE_COUNTERS,
        },
      },
    };
  });
};

/**
 * Adds a field into a group in state
 * @param {string} suiteId
 * @param {string} group
 * @param {string} fieldName
 */
const addFieldToGroup = (suiteId, group, fieldName) => {
  if (group === undefined) {
    return;
  }

  patch(suiteId, state => {
    if (state.groups[group]?.[fieldName] !== undefined) {
      return state;
    }

    return {
      ...state,
      groups: {
        ...state.groups,
        [group]: {
          ...state.groups[group],
          [fieldName]: { ...BASE_COUNTERS },
        },
      },
    };
  });
};

/**
 * Runs sync tests - or extracts promise.
 * @param {VestTest} testObject VestTest instance.
 * @returns {*} Result from test callback.
 */
const sync = testObject =>
  runTest(testObject, () => {
    let result;
    try {
      result = testObject.testFn.apply(testObject);
    } catch (e) {
      result = false;
    }

    if (result === false) {
      testObject.fail();
    }

    return result;
  });

/**
 * Registers test, if async - adds to pending array
 * @param {VestTest} testObject   A VestTest Instance.
 */
const register = testObject => {
  initField(testObject.suiteId, testObject.fieldName);
  addFieldToGroup(testObject.suiteId, testObject.group, testObject.fieldName);

  // Run test callback.
  // If a promise is returned, set as async and
  // Move to pending list.
  const result = sync(testObject);
  if (typeof result?.then === 'function') {
    testObject.testFn = result;
    setPending(testObject.suiteId, testObject);
  }
};

/**
 * Test function used by consumer to provide their own validations.
 * @param {String} fieldName            Name of the field to test.
 * @param {String} [statement]          The message returned in case of a failure.
 * @param {function} testFn             The actual test callback.
 * @return {VestTest}                 A VestTest instance.
 */
const test = (fieldName, ...args) => {
  const { length, [length - 2]: statement, [length - 1]: testFn } = args;

  const ctx = singleton.useContext();

  const testObject = new VestTest({
    group: ctx.groupName,
    suiteId: ctx.suiteId,
    fieldName,
    statement,
    testFn,
  });

  if (isExcluded(fieldName)) {
    setSkippedTest(ctx.suiteId, fieldName);
    return testObject;
  }

  if (typeof testFn !== 'function') {
    return;
  }

  register(testObject);

  return testObject;
};

export default test;
