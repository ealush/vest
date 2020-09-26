import _ from 'lodash';
import vest from '../..';
import collector from '../../../../../shared/testUtils/collector';
import resetState from '../../../testUtils/resetState';
import runRegisterSuite from '../../../testUtils/runRegisterSuite';
import suiteIdByName from '../../../testUtils/suiteIdByName';
import testDummy from '../../../testUtils/testDummy';
import group from '../../hooks/group';
import hasRemainingTests from '../suite/hasRemainingTests';
import * as suiteState from '../suite/suiteState';
import {
  SEVERITY_COUNT_ERROR,
  SEVERITY_COUNT_WARN,
} from '../test/lib/VestTest/constants';
import produce from '.';

const counter = ((n = 0) => () => n++)();
const DRAFT_EXCLUDED_METHODS = ['done'];
const GENERATED_METHODS = [
  'hasErrors',
  'hasWarnings',
  'getErrors',
  'getWarnings',
  ...DRAFT_EXCLUDED_METHODS,
];

const failingFields = {};
const warningFields = {};

const SKIPPED_FIELD = 'skipped_field_name';
const groupName = 'group_name';

let suiteId, state, produced;

const KEPT_PROPERTIES = [
  SEVERITY_COUNT_ERROR,
  SEVERITY_COUNT_WARN,
  'tests',
  'name',
  'groups',
];

let collect;
const { create } = vest;

const runCreateSuite = suiteName =>
  create(suiteName, () => {
    suiteId = suiteIdByName(suiteName);

    vest.skip(SKIPPED_FIELD);
    collect(testDummy(vest).failing('field_1'));
    collect(testDummy(vest).passing(SKIPPED_FIELD));
    collect(testDummy(vest).failingWarning('field_3'));

    collect(testDummy(vest).passingWarning('field_4'));

    collect(testDummy(vest).failing('field_5'));
    collect(testDummy(vest).failing('field_5'));
  })();

describe('module: produce', () => {
  let suiteName, testKeys;

  beforeEach(() => {
    collect = collector();
    suiteName = `suite_${counter()}`;
    resetState();
    runCreateSuite(suiteName);
    state = suiteState.getCurrentState(suiteId);
    testKeys = [
      ...new Set(state.testObjects.map(({ fieldName }) => fieldName)),
    ];
    produced = produce(state);

    collect.collection.forEach(({ fieldName, failed, isWarning }) => {
      if (failed) {
        failingFields[fieldName] = true;
      }

      if (isWarning) {
        warningFields[fieldName] = true;
      }
    });
  });

  it('Should create a deep copy of subset of the state', () => {
    expect(
      _.pick(suiteState.getCurrentState(suiteId), KEPT_PROPERTIES)
    ).isDeepCopyOf(_.pick(produced, KEPT_PROPERTIES));
  });

  it.each(GENERATED_METHODS)(
    'Should add `%s` method to the output object',
    name => {
      expect(typeof produced[name]).toBe('function');
    }
  );

  describe('When draft: true', () => {
    beforeEach(() => {
      suiteName = `suite_${counter()}`;
      runCreateSuite(suiteName);
      produced = produce(state, { draft: true });
    });

    it.each(DRAFT_EXCLUDED_METHODS)(
      'Should produce output object without `%s` method',
      name => {
        expect(produced[name]).toBeUndefined();
      }
    );

    it.each(_.difference(GENERATED_METHODS, DRAFT_EXCLUDED_METHODS))(
      'Should produce output object with `%s` method',
      name => {
        expect(typeof produced[name]).toBe('function');
      }
    );
  });

  describe('method: getErrors', () => {
    let errors;
    beforeEach(() => {
      errors = testKeys.filter(key =>
        Boolean(!warningFields[key] && failingFields[key])
      );
      describe('When invoked with field name', () => {
        it('Should return all statement messages for failed field', () => {
          errors.forEach(field => {
            expect(produced.getErrors(field)).toEqual(
              produce(suiteState.getCurrentState(suiteId)).tests[field].errors
            );
          });
        });
      });
      describe('When invoked without field name', () => {
        it('Should return all statement messages', () => {
          const failures = errors.reduce(
            (failures, key) =>
              Object.assign(failures, {
                [key]: produce(suiteState.getCurrentState(suiteId)).tests[key]
                  .errors,
              }),
            {}
          );
          expect(produced.getErrors()).toEqual(failures);
        });
      });
    });
  });
  describe('method: getWarnings', () => {
    let warnings;
    beforeEach(() => {
      warnings = testKeys.filter(key =>
        Boolean(warningFields[key] && failingFields[key])
      );
    });
    describe('When invoked with field name', () => {
      it('Should return all statement messages for failed field', () => {
        warnings.forEach(field => {
          expect(produced.getWarnings(field)).toEqual(
            produce(suiteState.getCurrentState(suiteId)).tests[field].warnings
          );
        });
      });
    });
    describe('When invoked without field name', () => {
      it('Should return all statement messages', () => {
        const failures = warnings.reduce(
          (failures, key) =>
            Object.assign(failures, {
              [key]: produce(suiteState.getCurrentState(suiteId)).tests[key]
                .warnings,
            }),
          {}
        );
        expect(produced.getWarnings()).toEqual(failures);
      });
    });
  });
  describe('method: hasErrors', () => {
    describe('When invoked with field name', () => {
      it('Should return the error count of the field', () => {
        testKeys.forEach(key => {
          expect(produced.hasErrors(key)).toBe(
            !!produce(suiteState.getCurrentState(suiteId)).tests[key].errorCount
          );
        });
      });
    });
    describe('When invoked without field name', () => {
      it('Should return the error count of the whole suite', () => {
        expect(produced.hasErrors()).toBe(
          !!produce(suiteState.getCurrentState(suiteId)).errorCount
        );
      });
    });
  });
  describe('method: hasWarnings', () => {
    describe('When invoked with field name', () => {
      it('Should return the warning count of the field', () => {
        testKeys.forEach(key => {
          expect(produced.hasWarnings(key)).toBe(
            !!produce(suiteState.getCurrentState(suiteId)).tests[key].warnCount
          );
        });
      });
    });
    describe('When invoked without field name', () => {
      it('Should return the warn count of the whole suite', () => {
        expect(produced.hasWarnings()).toBe(
          !!produce(suiteState.getCurrentState(suiteId)).warnCount
        );
      });
    });
  });

  describe('method: hasErrorsByGroup', () => {
    let validate, res;

    describe('When no group passed', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          group(groupName, () => {
            testDummy(vest).failing();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasErrorsByGroup()).toBe(false);
      });

      it('Should return false when group does not exist', () => {
        expect(res.hasErrorsByGroup('fake-group')).toBe(false);
      });
    });
    describe('When no errors', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passing();
          testDummy(vest).failing();
          testDummy(vest).failingWarning();

          group(groupName, () => {
            testDummy(vest).passing();
            testDummy(vest).failingWarning();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasErrorsByGroup(groupName)).toBe(false);
      });
    });

    describe('When errors present', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passing();

          group(groupName, () => {
            testDummy(vest).failing();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasErrorsByGroup(groupName)).toBe(true);
      });
    });

    describe('With fieldName', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passing();

          group(groupName, () => {
            testDummy(vest).failing('failing_1');
            testDummy(vest).passing('passing_1');
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false when field is passing', () => {
        expect(res.hasErrorsByGroup(groupName, 'passing_1')).toBe(false);
      });

      it('Should return true when field is failing', () => {
        expect(res.hasErrorsByGroup(groupName, 'failing_1')).toBe(true);
      });

      it('Should return false when field is not present', () => {
        expect(res.hasErrorsByGroup(groupName, 'I do not Exist')).toBe(false);
      });
    });
  });
  describe('method: hasWarningsByGroup', () => {
    let validate, res;

    describe('When no group passed', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          group(groupName, () => {
            testDummy(vest).failingWarning();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasWarningsByGroup()).toBe(false);
      });

      it('Should return false when group does not exist', () => {
        expect(res.hasWarningsByGroup('fake-group')).toBe(false);
      });
    });
    describe('When no warnings', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passing();
          testDummy(vest).failing();
          testDummy(vest).failingWarning();

          group(groupName, () => {
            testDummy(vest).passingWarning();
            testDummy(vest).failing();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasWarningsByGroup(groupName)).toBe(false);
      });
    });

    describe('When warnings present', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passingWarning();

          group(groupName, () => {
            testDummy(vest).failingWarning();
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return true', () => {
        expect(res.hasWarningsByGroup(groupName)).toBe(true);
      });
    });

    describe('With fieldName', () => {
      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).passingWarning();

          group(groupName, () => {
            testDummy(vest).failingWarning('failing_1');
            testDummy(vest).passingWarning('passing_1');
          });
        });

      beforeEach(() => {
        resetState();
        validate = validation();
        res = validate();
      });

      it('Should return false when field is passing', () => {
        expect(res.hasWarningsByGroup(groupName, 'passing_1')).toBe(false);
      });

      it('Should return true when field is failing', () => {
        expect(res.hasWarningsByGroup(groupName, 'failing_1')).toBe(true);
      });

      it('Should return false when field is not present', () => {
        expect(res.hasWarningsByGroup(groupName, 'I do not Exist')).toBe(false);
      });
    });
  });
  describe('method: done', () => {
    let doneCallback_1, doneCallback_2;
    beforeEach(() => {
      doneCallback_1 = jest.fn();
      doneCallback_2 = jest.fn();
    });
    describe('When no async tests', () => {
      it('Sanity', () => {
        runRegisterSuite({ name: suiteId });
        const state = suiteState.getCurrentState(suiteId);
        expect(hasRemainingTests(state)).toBe(false);
      });

      describe('When invoked without a field name', () => {
        it('Should run callback immediately', () => {
          expect(doneCallback_1).not.toHaveBeenCalled();
          produced.done(doneCallback_1);
          expect(doneCallback_1).toHaveBeenCalled();
          expect(doneCallback_2).not.toHaveBeenCalled();
          produced.done(doneCallback_2);
          expect(doneCallback_2).toHaveBeenCalled();
        });

        it('Should pass produced result to callback', () => {
          produced.done(doneCallback_1).done(doneCallback_2);
          expect(doneCallback_1.mock.calls[0][0]).isDeepCopyOf(produce(state));
          expect(doneCallback_2.mock.calls[0][0]).isDeepCopyOf(produce(state));
        });

        it('Should return produced result', () => {
          expect(produced.done(doneCallback_1)).toBe(produce(state));
        });
      });

      describe('When invoked with field name', () => {
        it('Should run callback immediately', () => {
          expect(doneCallback_1).not.toHaveBeenCalled();
          produced.done('field_1', doneCallback_1);
          expect(doneCallback_1).toHaveBeenCalled();
          expect(doneCallback_2).not.toHaveBeenCalled();
          produced.done('field_5', doneCallback_2);
          expect(doneCallback_2).toHaveBeenCalled();
        });

        it('Should pass produced result to callback', () => {
          produced.done('field_1', doneCallback_1).done(doneCallback_2);

          expect(doneCallback_1.mock.calls[0][0]).isDeepCopyOf(produce(state));
          expect(doneCallback_2.mock.calls[0][0]).isDeepCopyOf(produce(state));
        });

        it('Should return produced result', () => {
          expect(produced.done('field_1', doneCallback_1)).toBe(produce(state));
        });

        describe('When field name does not exist in suite', () => {
          it('Should return without calling the callback', () => {
            produced.done('field_1', doneCallback_1);
            produced.done('I_Do_Not_Exist', doneCallback_2);
            expect(doneCallback_1).toHaveBeenCalled();
            expect(doneCallback_2).not.toHaveBeenCalled();
          });
        });
        describe('When field is skipped', () => {
          it('Should return without calling the callback', () => {
            produced.done('field_1', doneCallback_1);
            produced.done(SKIPPED_FIELD, doneCallback_2);
            expect(doneCallback_1).toHaveBeenCalled();
            expect(doneCallback_2).not.toHaveBeenCalled();
          });
        });
      });
    });

    describe('When async (has remaining tests)', () => {
      beforeEach(() => {
        state = suiteState.patch(suiteId, state => ({
          ...state,
          pending: state.pending.concat({ fieldName: 'field_1' }),
          isAsync: true,
        }));
        produced = produce(state);
      });

      it('Sanity', () => {
        expect(hasRemainingTests(state)).toBe(true);
      });

      describe('When invoked without field name', () => {
        it('Should return without running callback', () => {
          produced.done(doneCallback_1);
          expect(doneCallback_1).not.toHaveBeenCalled();
        });
        it('Should return produced output', () => {
          expect(produced.done(doneCallback_1)).toBe(produce(state));
        });

        it('Should add callback to `doneCallBacks` array', () =>
          new Promise(done => {
            produced.done(() => done());

            // The reason we do this instead of just checking the array contents is
            // that in produce().done() we wrap the callback - so we don't have
            // access to it. Instead what we do here is only allow the test to
            // finish if the callback runs.
            suiteState.getCurrentState(suiteId).doneCallbacks[0]();
          }));
      });

      describe('When invoked with field name', () => {
        let suiteName;

        beforeEach(() => {
          suiteName = 'async-suite';
        });

        const runCreateSuite = () =>
          create(suiteName, () => {
            suiteId = suiteIdByName(suiteName);
            testDummy().failingAsync('field_1');
            testDummy().passing('sync_field_2');
          })();

        describe('When field is async', () => {
          it('Should add field to fieldCallbacks and run it when the test finishes', () =>
            new Promise(done => {
              const produced = runCreateSuite();
              expect(
                suiteState.getCurrentState(suiteName).fieldCallbacks['field_1']
              ).toBeUndefined();

              // The test will pass only when done gets called.
              produced.done('field_1', done);

              expect(
                suiteState.getCurrentState(suiteName).fieldCallbacks['field_1']
              ).not.toBeUndefined();
            }));
        });

        describe('When field is sync', () => {
          it('Should run callback immediately', () => {
            const produced = runCreateSuite();
            suiteId = suiteIdByName(suiteName);
            expect(
              suiteState.getCurrentState(suiteId).fieldCallbacks['sync_field_2']
            ).toBeUndefined();
            produced.done('sync_field_2', doneCallback_2);
            expect(doneCallback_2).toHaveBeenCalled();
            expect(
              suiteState.getCurrentState(suiteId).fieldCallbacks['sync_field_2']
            ).toBeUndefined();
          });
        });
      });

      describe('When delayed', () => {
        const validate = vest.create('delayed_done', () => {
          testDummy(vest).failing('field_1', 'error_1:a');
          testDummy(vest).failingAsync('field_2', 'error_1:b');
          testDummy(vest).failingAsync('field_3', 'error_1:c', { time: 100 });
        });

        afterEach(() => {
          resetState();
        });

        it('Should call done callback immediately when delayed', () => {
          const res = validate();
          return new Promise(done => {
            setTimeout(() => {
              const doneCb = jest.fn();
              res.done(doneCb);
              expect(doneCb).toHaveBeenCalled();
              done();
            }, 500);
          });
        });
      });
    });
  });
  describe('method: getErrorsByGroup', () => {
    let res, validate;

    const validation = () =>
      vest.create('suite_name', () => {
        testDummy(vest).failing('field_1');
        testDummy(vest).passing('field_2');

        group(groupName, () => {
          testDummy(vest).failing('field_1', 'error_1:a');
          testDummy(vest).failing('field_1', 'error_1:b');
          testDummy(vest).failing('field_2', 'error_2');
          testDummy(vest).passing('field_2');
          testDummy(vest).failing('field_3', 'error_3');
          testDummy(vest).failingWarning('field_1');
          testDummy(vest).failingWarning('field_4');
          testDummy(vest).passing('field_5');
        });
      });

    beforeEach(() => {
      validate = validation();
      res = validate();
    });

    afterEach(() => {
      resetState();
    });

    describe('When no group passed', () => {
      it('Should throw error', () => {
        expect(() => res.getErrorsByGroup()).toThrow(
          '[Vest]: getErrorsByGroup requires a group name. Received `undefined` instead.'
        );
      });
    });

    describe('When no field name passed', () => {
      it('Should return error array by field', () => {
        expect(res.getErrorsByGroup(groupName)).toEqual({
          field_1: ['error_1:a', 'error_1:b'],
          field_2: ['error_2'],
          field_3: ['error_3'],
        });
      });
    });

    describe('When field name passed', () => {
      it('Should return error array for provided field', () => {
        expect(res.getErrorsByGroup(groupName, 'field_1')).toEqual([
          'error_1:a',
          'error_1:b',
        ]);
        expect(res.getErrorsByGroup(groupName, 'field_2')).toEqual(['error_2']);
        expect(res.getErrorsByGroup(groupName, 'field_3')).toEqual(['error_3']);
        expect(res.getErrorsByGroup(groupName, 'field_4')).toEqual([]);
        expect(res.getErrorsByGroup(groupName, 'field_5')).toEqual([]);
      });
    });

    describe('When field does not exist', () => {
      it('Should return an empty array', () => {
        expect(res.getErrorsByGroup(groupName, 'field_100')).toEqual([]);
      });
    });
  });

  describe('method: getWarningsByGroup', () => {
    let res, validate;

    const validation = () =>
      vest.create('suite_name', () => {
        testDummy(vest).failingWarning('field_1');
        testDummy(vest).passing('field_2');

        group(groupName, () => {
          testDummy(vest).failingWarning('field_1', 'warning_1:a');
          testDummy(vest).failingWarning('field_1', 'warning_1:b');
          testDummy(vest).failingWarning('field_2', 'warning_2');
          testDummy(vest).passing('field_2');
          testDummy(vest).failingWarning('field_3', 'warning_3');
          testDummy(vest).failing('field_1');
          testDummy(vest).failing('field_4');
          testDummy(vest).passing('field_5');
        });
      });

    beforeEach(() => {
      validate = validation();
      res = validate();
    });

    afterEach(() => {
      resetState();
    });

    describe('When no group passed', () => {
      it('Should throw error', () => {
        expect(() => res.getWarningsByGroup()).toThrow(
          '[Vest]: getWarningsByGroup requires a group name. Received `undefined` instead.'
        );
      });
    });

    describe('When no field name passed', () => {
      it('Should return warning array by field', () => {
        expect(res.getWarningsByGroup(groupName)).toEqual({
          field_1: ['warning_1:a', 'warning_1:b'],
          field_2: ['warning_2'],
          field_3: ['warning_3'],
        });
      });
    });

    describe('When field name passed', () => {
      it('Should return warning array for provided field', () => {
        expect(res.getWarningsByGroup(groupName, 'field_1')).toEqual([
          'warning_1:a',
          'warning_1:b',
        ]);
        expect(res.getWarningsByGroup(groupName, 'field_2')).toEqual([
          'warning_2',
        ]);
        expect(res.getWarningsByGroup(groupName, 'field_3')).toEqual([
          'warning_3',
        ]);
        expect(res.getWarningsByGroup(groupName, 'field_4')).toEqual([]);
        expect(res.getWarningsByGroup(groupName, 'field_5')).toEqual([]);
      });
    });

    describe('When field does not exist', () => {
      it('Should return an empty array', () => {
        expect(res.getWarningsByGroup(groupName, 'field_100')).toEqual([]);
      });
    });
  });

  describe('produce cache (integragion)', () => {
    describe('sync', () => {
      const control = jest.fn();
      let draft, state;
      const validate = vest.create('cache', () => {
        draft = vest.draft();
        state = vest.get('cache');
        expect(draft).toBe(vest.draft());
        expect(state).toBe(vest.get('cache'));
        testDummy(vest).failing();
        expect(state).not.toBe(vest.get('cache'));
        expect(draft).not.toBe(vest.draft());
        testDummy(vest).failing();
        state = vest.get('cache');
        control();
      });

      it('Should return same result as as long as the state did not change', () => {
        let res = validate().done(result => {
          // Done results are not cached.
          // See produce / index for more info
          expect(result).isDeepCopyOf(vest.get('cache'));
        });
        expect(control).toHaveBeenCalledTimes(1);
        expect(state).toBe(vest.get('cache'));
        expect(res).not.toBe(draft);
        expect(res).not.toBe(state);
        expect(draft).not.toBe(vest.get('cache'));
        res = validate().done(result => {
          expect(result).isDeepCopyOf(vest.get('cache'));
        });
        expect(res).not.toBe(draft);
        expect(res).not.toBe(state);
        expect(control).toHaveBeenCalledTimes(2);
      });
    });

    describe('Async', () => {
      let result;
      const validate = vest.create('cache-async', () => {
        testDummy(vest).passing('field_1');
        testDummy(vest).failing('field_2');
        testDummy(vest).failingAsync('field_3');
        testDummy(vest).failingAsync('field_4', { time: 250 });
      });

      it('Should produce correct validation result', () => {
        result = validate();
        const control = jest.fn();
        return new Promise(done => {
          expect(result.hasErrors('field_1')).toBe(false);
          expect(result.hasErrors('field_2')).toBe(true);
          expect(result.hasErrors('field_3')).toBe(false);
          expect(result.hasErrors('field_4')).toBe(false);

          result.done('field_3', res => {
            expect(res).isDeepCopyOf(vest.get('cache-async'));
            expect(res).not.toBe(result);
            expect(res).not.isDeepCopyOf(result);
            expect(res.hasErrors('field_1')).toBe(false);
            expect(res.hasErrors('field_2')).toBe(true);
            expect(res.hasErrors('field_3')).toBe(true);
            expect(res.hasErrors('field_4')).toBe(false);
            control();
          });

          result.done(res => {
            expect(res.tests.field_4.errorCount).toBe(1);
            expect(res).isDeepCopyOf(vest.get('cache-async'));
            expect(res).not.toBe(result);
            expect(res).not.isDeepCopyOf(result);
            expect(res.hasErrors('field_1')).toBe(false);
            expect(res.hasErrors('field_2')).toBe(true);
            expect(res.hasErrors('field_3')).toBe(true);
            expect(res.hasErrors('field_4')).toBe(true);

            done();
          });
        });
      });
    });
  });
});
