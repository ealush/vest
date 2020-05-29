import _ from 'lodash';
import resetState from '../../../../../testUtils/resetState';
import runRegisterSuite from '../../../../../testUtils/runRegisterSuite';
import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
import { setSkippedTest, setSkippedGroup, mergeSkipped } from '.';

const SUITE_NAME = 'suite_1';
const suiteId = 'suiteId_1';
const FIELD_NAME_1 = 'field_1';
const FIELD_NAME_2 = 'field_2';
const GROUP_NAME_1 = 'group_1';
const GROUP_NAME_2 = 'group_2';

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
  groups: {
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

  describe('export: setSkippedTest', () => {
    describe('When field already skipped', () => {
      beforeEach(() => {
        setSkippedTest(suiteId, FIELD_NAME_1);
      });
      it('Should keep state unchanged', () => {
        const state = _.cloneDeep(getSuiteState(suiteId));
        setSkippedTest(suiteId, FIELD_NAME_1);
        expect(getSuiteState(suiteId)).toEqual(state);
      });
    });

    describe('When field is not yet skipped', () => {
      it('Should mark field as skipped', () => {
        expect(
          getSuiteState(suiteId).skippedTests[FIELD_NAME_1]
        ).toBeUndefined();
        setSkippedTest(suiteId, FIELD_NAME_1);
        expect(getSuiteState(suiteId).skippedTests[FIELD_NAME_1]).toBe(true);
        expect(getSuiteState(suiteId)).toMatchSnapshot();
      });
    });
  });

  describe('export: setSkippedGroup', () => {
    describe('When group already skipped', () => {
      beforeEach(() => {
        setSkippedGroup(suiteId, GROUP_NAME_1);
      });
      it('Should keep state unchanged', () => {
        const state = _.cloneDeep(getSuiteState(suiteId));
        setSkippedGroup(suiteId, GROUP_NAME_1);
        expect(getSuiteState(suiteId)).toEqual(state);
      });
    });

    describe('When group is not yet skipped', () => {
      it('Should mark group as skipped', () => {
        expect(
          getSuiteState(suiteId).skippedGroups[GROUP_NAME_1]
        ).toBeUndefined();
        setSkippedGroup(suiteId, GROUP_NAME_1);
        expect(getSuiteState(suiteId).skippedGroups[GROUP_NAME_1]).toBe(true);
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

      describe('When no currently skipped fields or groups', () => {
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
              setSkippedTest(suiteId, FIELD_NAME_1);
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
              setSkippedTest(suiteId, FIELD_NAME_2);
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

      describe('When skipped group exists in previous state', () => {
        let mock;
        beforeEach(() => {
          mock = _.cloneDeep(PREV_STATE_MOCK);
          patch(suiteId, state => _.merge({ ...state }, mock));
          runRegisterSuite({ name: SUITE_NAME, suiteId });
        });

        it('Should copy prev group state over', () => {
          expect(getSuiteState(suiteId).groups[GROUP_NAME_2]).toBeUndefined();
          setSkippedGroup(suiteId, GROUP_NAME_2);
          mergeSkipped(suiteId);
          expect(getSuiteState(suiteId).groups[GROUP_NAME_2]).toEqual(
            mock.groups[GROUP_NAME_2]
          );
        });
      });
    });
  });
});
