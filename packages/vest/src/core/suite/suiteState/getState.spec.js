import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import * as suiteState from '.';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';
const suiteId_2 = 'suiteId_3';

describe('getCurrentState', () => {
  it('Should return current suite state by key', () => {
    runRegisterSuite({ name: suiteName, suiteId });
    runRegisterSuite({ name: suiteName, suiteId: suiteId_2 });
    const [currentState] = suiteState.getSuite(suiteId);
    expect(suiteState.getCurrentState(suiteId)).toBe(currentState);
  });
});
