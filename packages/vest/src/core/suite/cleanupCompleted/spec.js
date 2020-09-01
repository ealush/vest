import runRegister from '../../../../testUtils/runRegister';
import {
  OPERATION_MODE_STATEFUL,
  OPERATION_MODE_STATELESS,
} from '../../../constants';
import * as state from '../../state';
import { KEY_SUITES } from '../../state/constants';
import cleanupCompleted from '.';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';
const suiteId_2 = 'suiteId_2';
let defaultContext;
describe('cleanupCompleted', () => {
  beforeEach(() => {
    defaultContext = {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATEFUL,
    };
  });

  describe('When suite does not exist', () => {
    it('Should throw an error', () => {
      expect(() => cleanupCompleted(suiteId)).toThrow();
    });
  });

  describe('When suite exists', () => {
    describe('When stateless', () => {
      let suite2Context;
      beforeEach(() => {
        suite2Context = {
          suiteId: suiteId_2,
          name: suiteName,
          operationMode: OPERATION_MODE_STATELESS,
        };
        runRegister(suite2Context);
        runRegister(defaultContext);
      });
      it('Should remove suite from state', () => {
        expect(state.get()[KEY_SUITES]).toHaveProperty(suiteId);
        expect(state.get()[KEY_SUITES]).toHaveProperty(suiteId_2);
        cleanupCompleted(suiteId_2);
        expect(state.get()[KEY_SUITES]).not.toHaveProperty(suiteId_2);
        expect(state.get()[KEY_SUITES]).toHaveProperty(suiteId);
      });
    });
  });
});
