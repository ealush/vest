import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import state from '../../src/core/state';
import { KEY_STATE } from '../../src/core/state/constants';
import getSuiteState from '../../src/core/state/getSuiteState';
import singleton from '../../src/lib/singleton';
import runRegisterSuite from '../runRegisterSuite';

const resetState = (suiteId, suiteName = suiteId) => {
  singleton.set(KEY_STATE, null);
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
