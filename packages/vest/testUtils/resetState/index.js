import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import state from '../../src/core/state';
import getSuiteState from '../../src/core/state/getSuiteState';
import { SYMBOL_STATE } from '../../src/core/state/symbols';
import singleton from '../../src/lib/singleton';
import runRegisterSuite from '../runRegisterSuite';

const resetState = (suiteId, suiteName = suiteId) => {
  singleton.set(SYMBOL_STATE, null);
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
