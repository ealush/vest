import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import * as state from '../../src/core/state';
import getSuiteState from '../../src/core/state/getSuiteState';
import runRegisterSuite from '../runRegisterSuite';

const resetState = (suiteId, suiteName = suiteId) => {
  state.set(() => null);
  state.register();

  if (suiteName) {
    runRegisterSuite({
      suiteId,
      name: suiteName,
      operationMode: OPERATION_MODE_STATEFUL,
    });
    return getSuiteState(suiteId);
  }
};

export default resetState;
