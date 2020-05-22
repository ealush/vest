import { getState } from '..';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import {
  OPERATION_MODE_STATEFUL,
  OPERATION_MODE_STATELESS,
} from '../../../constants';
import runWithContext from '../../../lib/runWithContext';
import singleton from '../../../lib/singleton';
import { SYMBOL_SUITES } from '../symbols';
import cleanupStatelessSuite from '.';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';
const suiteId_2 = 'suiteId_2';
let context, defaultContext;
describe('cleanupStatelessSuite', () => {
  beforeEach(() => {
    defaultContext = {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATEFUL,
    };
  });

  describe('When suite does not exist', () => {
    it('Should throw an error', () => {
      expect(() => cleanupStatelessSuite(suiteId)).toThrow();
    });
  });

  it('Should clear the context after running', () => {
    runRegisterSuite(defaultContext);
    context = singleton.useContext();
    runWithContext(context, () => {
      expect(singleton.useContext()).toBe(context);
      cleanupStatelessSuite(suiteId);
      expect(singleton.useContext()).toBeNull();
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
        runRegisterSuite(suite2Context);
        runRegisterSuite(defaultContext);
      });
      it('Should remove suite from state', () => {
        expect(getState()[SYMBOL_SUITES]).toHaveProperty(suiteId);
        expect(getState()[SYMBOL_SUITES]).toHaveProperty(suiteId_2);
        cleanupStatelessSuite(suiteId_2);
        expect(getState()[SYMBOL_SUITES]).not.toHaveProperty(suiteId_2);
        expect(getState()[SYMBOL_SUITES]).toHaveProperty(suiteId);
      });
    });
  });
});
