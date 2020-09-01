import { OPERATION_MODE_STATEFUL } from '../../src/constants';
import * as state from '../../src/core/state';
import getState from '../../src/core/suite/getState';
import runRegister from '../runRegister';

const resetState = (Id, Name = Id) => {
  state.set(() => null);
  state.register();

  if (Name) {
    runRegister({
      Id,
      name: Name,
      operationMode: OPERATION_MODE_STATEFUL,
    });
    return getState(Id);
  }
};

export default resetState;
