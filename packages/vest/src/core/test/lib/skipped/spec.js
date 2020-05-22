import _ from 'lodash';
import resetState from '../../../../../testUtils/resetState';
import runRegisterSuite from '../../../../../testUtils/runRegisterSuite';
import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
import { setSkipped, mergeSkipped } from '.';

const SUITE_NAME = 'suite_1';
const suiteId = 'suiteId_1';
const FIELD_NAME_1 = 'field_1';
const FIELD_NAME_2 = 'field_2';

const PREV_STATE_MOCK = {
  tests: {
    [FIELD_NAME_1]: {
      errorCount: 0,
      warnCount: 1,
      errors: [],
      warnings: ['warning_string'],
    },
    [FIELD_NAME_2]: {
      errorCount: 1,
      warnCount: 0,
      errors: ['error_string'],
      warnings: [],
    },
  },
};

describe('module: skipped', () => {
  beforeEach(() => {
    resetState(suiteId, SUITE_NAME);
  });

  describe('export: setSkipped', () => {
    describe('When field already skipped', () => {
      beforeEach(() => {
        setSkipped(suiteId, FIELD_NAME_1);
      });
      it('Should keep state unchanged', () => {
        const state = _.cloneDeep(getSuiteState(suiteId));
        setSkipped(suiteId, FIELD_NAME_1);
        expect(getSuiteState(suiteId)).toEqual(state);
      });
    });

    describe('When field is not yet skipped', () => {
      it('Should marked field as skipped', () => {
        expect(getSuiteState(suiteId).skipped[FIELD_NAME_1]).toBeUndefined();
        setSkipped(suiteId, FIELD_NAME_1);
        expect(getSuiteState(suiteId).skipped[FIELD_NAME_1]).toBe(true);
        expect(getSuiteState(suiteId)).toMatchSnapshot();
      });
    });
  });

  describe('export: mergeSkipped', () => {
    describe('When no previous state', () => {
      it('Should keep state unchanged', () => {
        const state = _.cloneDeep(getSuiteState(suiteId));
        mergeSkipped(suiteId);
        expect(getSuiteState(suiteId)).toEqual(state);
      });
    });

    describe('When previous state exists', () => {
      beforeEach(() => {
        runRegisterSuite({ name: SUITE_NAME, suiteId });
      });

      describe('When no currently skipped fields', () => {
        it('Should keep state unchanged', () => {
          const state = _.cloneDeep(getSuiteState(suiteId));
          mergeSkipped(suiteId);
          expect(getSuiteState(suiteId)).toEqual(state);
        });
      });

      describe('When skipped fields exist', () => {
        describe('When skipped field does not exist in previous state', () => {
          it('Should keep state unchanged', () => {
            const state = _.cloneDeep(getSuiteState(suiteId));
            mergeSkipped(suiteId);
            expect(getSuiteState(suiteId)).toEqual(state);
          });
        });

        describe('When skipped field exists in previous state', () => {
          let mock, state;
          beforeEach(() => {
            mock = _.cloneDeep(PREV_STATE_MOCK);
            patch(suiteId, state => _.merge({ ...state }, mock));
            runRegisterSuite({ name: SUITE_NAME, suiteId });
            state = _.cloneDeep(getSuiteState(suiteId));
          });

          describe('Warning field', () => {
            it('Should copy prev field state over', () => {
              expect(
                getSuiteState(suiteId).tests[FIELD_NAME_1]
              ).toBeUndefined();
              setSkipped(suiteId, FIELD_NAME_1);
              mergeSkipped(suiteId);
              expect(getSuiteState(suiteId).tests[FIELD_NAME_1]).toEqual(
                mock.tests[FIELD_NAME_1]
              );
              expect(getSuiteState(suiteId).warnCount).toBe(
                state.warnCount + mock.tests[FIELD_NAME_1].warnCount
              );
              expect(getSuiteState(suiteId).errorCount).toBe(state.errorCount);
              expect(getSuiteState(suiteId)).toMatchSnapshot();
            });
          });
          describe('Error field', () => {
            it('Should copy prev field state over', () => {
              expect(
                getSuiteState(suiteId).tests[FIELD_NAME_2]
              ).toBeUndefined();
              setSkipped(suiteId, FIELD_NAME_2);
              mergeSkipped(suiteId);
              expect(getSuiteState(suiteId).tests[FIELD_NAME_2]).toEqual(
                mock.tests[FIELD_NAME_2]
              );
              expect(getSuiteState(suiteId).errorCount).toBe(
                state.errorCount + mock.tests[FIELD_NAME_2].errorCount
              );
              expect(getSuiteState(suiteId).warnCount).toBe(state.warnCount);
              expect(getSuiteState(suiteId)).toMatchSnapshot();
            });
          });
        });
      });
    });
  });
});
