import { getState } from '..';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import { SYMBOL_SUITES } from '../symbols';
import getSuiteState from '.';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';
const suiteId_2 = 'suiteId_3';

describe('getSuiteState', () => {
  it('Should return current suite state by key', () => {
    runRegisterSuite({ name: suiteName, suiteId });
    runRegisterSuite({ name: suiteName, suiteId: suiteId_2 });
    const [currentState] = getState(SYMBOL_SUITES)[suiteId];
    expect(getSuiteState(suiteId)).toBe(currentState);
  });
});
