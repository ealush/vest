import resetState from '../../../../testUtils/resetState';
import runRegisterSuite from '../../../../testUtils/runRegisterSuite';
import { OPERATION_MODE_STATEFUL } from '../../../constants';
import * as suiteState from '.';

const suiteName = 'suite_1';
const suiteId = 'suiteId_1';

let context;

describe('patch', () => {
  let patcher, suite, currentState, prevState;

  beforeEach(() => {
    resetState();
    context = {
      name: suiteName,
      suiteId,
      operationMode: OPERATION_MODE_STATEFUL,
    };
  });

  describe('When patcher is a function', () => {
    beforeEach(() => {
      patcher = jest.fn(state => ({ ...state, ...{ k: 'v' } }));
      resetState();
      runRegisterSuite(context);
      suite = suiteState.getSuite(suiteId);
      currentState = suite[0];
      prevState = suite[1];
      suiteState.patch(suiteId, patcher);
    });
    it('Should set current state value to patcher argument return value', () => {
      expect(suiteState.getSuite(suiteId)[0]).toBe(
        patcher.mock.results[0].value
      );
    });
    it('Should pass current and prev state as the patcher arguments', () => {
      expect(patcher).toHaveBeenCalledWith(currentState, prevState);
    });

    it('Should return next state', () => {
      expect(suiteState.patch(suiteId, patcher)).toBe(
        suiteState.getCurrentState(suiteId)
      );
    });
  });
  describe('When patcher is not a function', () => {
    beforeEach(() => {
      patcher = {};
      resetState();
      runRegisterSuite(context);
    });

    it('Should throw an error', () => {
      expect(() => suiteState.patch(suiteId, patcher)).toThrow(Error);
    });
  });
});
