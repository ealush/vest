import {
  SEVERITY_COUNT_WARN,
  SEVERITY_COUNT_ERROR,
  SEVERITY_GROUP_WARN,
  SEVERITY_GROUP_ERROR,
  TEST_COUNT,
} from '../constants';

import type { VestTestType } from '../../test/lib/VestTest';

const genTestObject = (stateKey: object, testObject: VestTestType) => {
  const { fieldName, isWarning, failed, statement } = testObject;

  stateKey[fieldName] = stateKey[fieldName] || {
    [SEVERITY_COUNT_WARN]: 0,
    [SEVERITY_COUNT_ERROR]: 0,
    [TEST_COUNT]: 0,
  };

  const testKey = stateKey[fieldName];

  stateKey[fieldName][TEST_COUNT]++;

  if (failed) {
    if (isWarning) {
      testKey[SEVERITY_COUNT_WARN]++;
      if (statement) {
        testKey[SEVERITY_GROUP_WARN] = (
          testKey[SEVERITY_GROUP_WARN] || []
        ).concat(statement);
      }
    } else {
      testKey[SEVERITY_COUNT_ERROR]++;
      if (statement) {
        testKey[SEVERITY_GROUP_ERROR] = (
          testKey[SEVERITY_GROUP_ERROR] || []
        ).concat(statement);
      }
    }
  }

  return testKey;
};

/**
 * Counts the failed tests and adds global counters
 */
export const countFailures = (state: IResultValues): IResultValues => {
  state[SEVERITY_COUNT_ERROR] = 0;
  state[SEVERITY_COUNT_WARN] = 0;
  state[TEST_COUNT] = 0;
  for (const test in state.tests) {
    state[SEVERITY_COUNT_ERROR] += state.tests[test][SEVERITY_COUNT_ERROR];
    state[SEVERITY_COUNT_WARN] += state.tests[test][SEVERITY_COUNT_WARN];
    state[TEST_COUNT] += state.tests[test][TEST_COUNT];
  }
  return state;
};

/**
 * Reads the testObjects list and gets full validation result from it.
 */
const genTestsSummary = (state: ISuiteState): ISuiteState => {
  state.tests = {};
  state.groups = {};

  state.testObjects.forEach(testObject => {
    const { fieldName, groupName } = testObject;

    state.tests[fieldName] = genTestObject(state.tests, testObject);

    if (groupName) {
      state.groups[groupName] = state.groups[groupName] || {};
      state.groups[groupName][fieldName] = genTestObject(
        state.groups[groupName],
        testObject
      );
    }
  });

  return state;
};

export default genTestsSummary;
