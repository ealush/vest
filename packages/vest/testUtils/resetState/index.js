import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import state from '../../src/core/state';
import * as suiteState from '../../src/core/suite/suiteState';
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
    return suiteState.getCurrentState(suiteId);
  }
};

export default resetState;
