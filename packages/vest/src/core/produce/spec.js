import _ from 'lodash';
import isDeepCopy from '../../../testUtils/isDeepCopy';
import resetState from '../../../testUtils/resetState';
import runRegisterSuite from '../../../testUtils/runRegisterSuite';
import runSpec from '../../../testUtils/runSpec';
import suiteIdByName from '../../../testUtils/suiteIdByName';
import getSuiteState from '../state/getSuiteState';
import hasRemainingTests from '../state/hasRemainingTests';
import patch from '../state/patch';
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

const failingFields = {
  field_1: true,
  field_3: true,
  field_5: true,
};
const warningFields = {
  field_3: true,
  field_4: true,
};

const SKIPPED_FIELD = 'skipped_field_name';

let suiteId, state, produced;

const KEPT_PROPERTIES = ['errorCount', 'warnCount', 'tests', 'name'];

runSpec(vest => {
  const { test, create } = vest;

  const runCreateSuite = suiteName =>
    create(suiteName, () => {
      suiteId = suiteIdByName(suiteName);

      vest.skip(SKIPPED_FIELD);
      test('field_1', 'statement_string_1', () => false);
      test(SKIPPED_FIELD, 'statement_string_2', () => {});
      test('field_3', 'statement_string_3', () => {
        vest.warn();
        return false;
      });

      test('field_4', 'statement_string_4', () => {
        vest.warn();
      });

      test('field_5', 'statement_string_5', () => false);
      test('field_5', 'statement_string_6', () => false);
    })();

  describe('module: produce', () => {
    let suiteName, testKeys;

    beforeEach(() => {
      suiteName = `suite_${counter()}`;
      resetState();
      runCreateSuite(suiteName);
      state = getSuiteState(suiteId);
      testKeys = Object.keys(state.tests);
      produced = produce(state);
    });

    it('Should create a deep copy of subset of the state', () => {
      isDeepCopy(
        _.pick(getSuiteState(suiteId), KEPT_PROPERTIES),
        _.pick(produced, KEPT_PROPERTIES)
      );
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
        'Should produce ouput object without `%s` method',
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
                getSuiteState(suiteId).tests[field].errors
              );
            });
          });
        });
        describe('When invoked without field name', () => {
          it('Should return all statement messages', () => {
            const failures = errors.reduce(
              (failures, key) =>
                Object.assign(failures, {
                  [key]: getSuiteState(suiteId).tests[key].errors,
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
              getSuiteState(suiteId).tests[field].warnings
            );
          });
        });
      });
      describe('When invoked without field name', () => {
        it('Should return all statement messages', () => {
          const failures = warnings.reduce(
            (failures, key) =>
              Object.assign(failures, {
                [key]: getSuiteState(suiteId).tests[key].warnings,
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
              !!getSuiteState(suiteId).tests[key].errorCount
            );
          });
        });
      });
      describe('When invoked without field name', () => {
        it('Should return the error count of the whole suite', () => {
          expect(produced.hasErrors()).toBe(
            !!getSuiteState(suiteId).errorCount
          );
        });
      });
    });
    describe('method: hasWarnings', () => {
      describe('When invoked with field name', () => {
        it('Should return the warning count of the field', () => {
          testKeys.forEach(key => {
            expect(produced.hasWarnings(key)).toBe(
              !!getSuiteState(suiteId).tests[key].warnCount
            );
          });
        });
      });
      describe('When invoked without field name', () => {
        it('Should return the warn count of the whole suite', () => {
          expect(produced.hasWarnings()).toBe(
            !!getSuiteState(suiteId).warnCount
          );
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
          const state = getSuiteState(suiteId);
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
            isDeepCopy(doneCallback_1.mock.calls[0][0], produce(state));
            isDeepCopy(doneCallback_2.mock.calls[0][0], produce(state));
          });

          it('Should return produced result', () => {
            isDeepCopy(produced.done(doneCallback_1), produce(state));
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

            isDeepCopy(doneCallback_1.mock.calls[0][0], produce(state));
            isDeepCopy(doneCallback_2.mock.calls[0][0], produce(state));
          });

          it('Should return produced result', () => {
            isDeepCopy(
              produced.done('field_1', doneCallback_1),
              produce(state)
            );
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
          state = patch(suiteId, state => ({
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
            isDeepCopy(produced.done(doneCallback_1), produce(state));
          });

          it('Should add callback to `doneCallBacks` array', () =>
            new Promise(done => {
              produced.done(() => done());

              // The reason we do this instead of just checking the array contents is
              // that in produce().done() we wrap the callback - so we don't have
              // access to it. Instead what we do here is only allow the test to
              // finish if the callback runs.
              getSuiteState(suiteId).doneCallbacks[0]();
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
              test('field_1', 'statement_string_1', () => Promise.reject());
              test('sync_field_2', 'statement_string_2', () => {});
            })();

          describe('When field is async', () => {
            it('Should add field to fieldCallbacks and run it when the test finishes', () =>
              new Promise(done => {
                const produced = runCreateSuite();
                expect(
                  getSuiteState(suiteName).fieldCallbacks['field_1']
                ).toBeUndefined();

                // The test will pass only when done gets called.
                produced.done('field_1', done);

                expect(
                  getSuiteState(suiteName).fieldCallbacks['field_1']
                ).not.toBeUndefined();
              }));
          });

          describe('When field is sync', () => {
            it('Should run callback immediately', () => {
              const produced = runCreateSuite();
              suiteId = suiteIdByName(suiteName);
              expect(
                getSuiteState(suiteId).fieldCallbacks['sync_field_2']
              ).toBeUndefined();
              produced.done('sync_field_2', doneCallback_2);
              expect(doneCallback_2).toHaveBeenCalled();
              expect(
                getSuiteState(suiteId).fieldCallbacks['sync_field_2']
              ).toBeUndefined();
            });
          });
        });
      });
    });
  });
});
