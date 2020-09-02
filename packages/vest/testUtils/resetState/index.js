import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import * as state from '../../src/core/state';
import getState from '../../src/core/suite/getState';
import runRegister from '../runRegister';

const resetState = (suiteId, suiteName = suiteId) => {
  state.set(() => null);
  state.register();

  if (suiteName) {
    runRegister({
      suiteId,
      name: suiteName,
      operationMode: OPERATION_MODE_STATEFUL,
    });
    return getState(suiteId);
  }
};

export default resetState;
