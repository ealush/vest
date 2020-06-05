import { getState } from '..';
import isDeepCopy from '../../../../testUtils/isDeepCopy';
import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import { OPERATION_MODE_STATEFUL } from '../../../constants';
import { KEY_SUITES } from '../constants';
import patch from '../patch';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';

let context;
describe('registerSuite', () => {
  let prevSuiteState;

  beforeEach(() => {
    resetState();
    context = {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATEFUL,
    };
  });

  describe('When suite does not exist in state', () => {
    it('Should create initial suite without prevState', () => {
      expect(getState(KEY_SUITES)[suiteId]).toBeUndefined();
      runRegisterSuite(context);
      expect(getState(KEY_SUITES)[suiteId]).toHaveLength(2);
      expect(getState(KEY_SUITES)[suiteId][1]).toBeUndefined();
      expect(getState(KEY_SUITES)[suiteId][0]).toMatchSnapshot();
    });
  });

  describe('When suite exists in state', () => {
    let suite;
    beforeEach(() => {
      runRegisterSuite(context);
      suite = getState(KEY_SUITES)[suiteId];
      prevSuiteState = suite[0];
      runRegisterSuite({ ...context });
    });
    it('Should move prev prevSuiteState into second array cell', () => {
      expect(getState(KEY_SUITES)[suiteId][1]).toBe(prevSuiteState);
    });

    describe('Prev state data handling', () => {
      describe('When lagging and/or pending exist in the previous state', () => {
        let pending, lagging;
        beforeEach(() => {
          pending = [jest.fn(), jest.fn(), jest.fn()];
          lagging = [jest.fn(), jest.fn(), jest.fn()];
          patch(suiteId, state => ({
            ...state,
            pending,
            lagging,
          }));
          runRegisterSuite(context);
        });
        it('Should merge previous pending and lagging into lagging', () => {
          isDeepCopy(suite[0].lagging, [...pending, ...lagging]);
        });

        it('Should match snapshot', () => {
          expect(suite).toMatchSnapshot();
        });
      });
      it('Should nullify prevState pending and lagging', () => {
        expect(suite[1].lagging).toBeNull();
        expect(suite[1].pending).toBeNull();
      });
    });

    it('Should match snapshot', () => {
      expect(suite).toMatchSnapshot();
    });
  });
});
