import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from 'vest';

describe('done', () => {
  describe('When no async tests', () => {
    it('Should call done callback immediately', () => {
      const result = vest.create(() => {
        dummyTest.passing();
        dummyTest.passing();
        dummyTest.failing();
        dummyTest.failing();
        dummyTest.passing();
        dummyTest.failingWarning('field_2');
      })();

      const doneCallback = jest.fn();
      const fieldDoneCallback = jest.fn();

      result.done(doneCallback).done('field_2', fieldDoneCallback);

      expect(doneCallback).toHaveBeenCalled();
      expect(fieldDoneCallback).toHaveBeenCalled();
    });
  });

  describe('When there are async tests', () => {
    describe('When field name is not passed', () => {
      it('Should run the done callback after all the fields finished running', () => {
        const check1 = jest.fn();
        const check2 = jest.fn();
        const check3 = jest.fn();
        return new Promise<void>(done => {
          const doneCallback = jest.fn(() => {
            expect(check1).toHaveBeenCalled();
            expect(check2).toHaveBeenCalled();
            expect(check3).toHaveBeenCalled();
            done();
          });
          const result = vest.create(() => {
            dummyTest.passingAsync('field_1', { time: 1000 });
            dummyTest.failingAsync('field_2', { time: 100 });
            dummyTest.passingAsync('field_3', { time: 0 });
            dummyTest.failing();
            dummyTest.passing();
          })();

          result.done(doneCallback);

          setTimeout(() => {
            expect(doneCallback).not.toHaveBeenCalled();
            check1();
          });
          setTimeout(() => {
            expect(doneCallback).not.toHaveBeenCalled();
            check2();
          }, 150);
          setTimeout(() => {
            expect(doneCallback).not.toHaveBeenCalled();
            check3();
          }, 900);
        });
      });
    });
  });

  describe('done arguments', () => {
    it('Should pass down the up to date validation result', () => {
      return new Promise<void>(done => {
        const result = vest.create(() => {
          dummyTest.failing('field_1', 'error message');
          dummyTest.passing('field_2');
          dummyTest.passingAsync('field_3', { time: 0 });
          dummyTest.failingAsync('field_4', {
            message: 'error_message',
            time: 100,
          });
          dummyTest.passingAsync('field_5', { time: 1000 });
        })();

        result
          .done('field_2', res => {
            expect(res.getErrors()).toEqual({ field_1: ['error message'] });
            expect(res).toMatchObject({
              errorCount: 1,
              groups: {},
              testCount: 5,
              tests: {
                field_1: {
                  errorCount: 1,
                  errors: ['error message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_2: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_3: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_4: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_5: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
              },
              warnCount: 0,
            });
          })
          .done('field_3', res => {
            expect(res).toMatchObject({
              errorCount: 1,
              groups: {},
              testCount: 5,
              tests: {
                field_1: {
                  errorCount: 1,
                  errors: ['error message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_2: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_3: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_4: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_5: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
              },
              warnCount: 0,
            });
          })
          .done('field_4', res => {
            expect(res.getErrors()).toEqual({
              field_1: ['error message'],
              field_4: ['error_message'],
            });
            expect(res).toMatchObject({
              errorCount: 2,
              groups: {},
              testCount: 5,
              tests: {
                field_1: {
                  errorCount: 1,
                  errors: ['error message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_2: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_3: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_4: {
                  errorCount: 1,
                  errors: ['error_message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_5: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
              },
              warnCount: 0,
            });
          })
          .done(res => {
            expect(res).toMatchObject({
              errorCount: 2,
              groups: {},
              testCount: 5,
              tests: {
                field_1: {
                  errorCount: 1,
                  errors: ['error message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_2: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_3: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
                field_4: {
                  errorCount: 1,
                  errors: ['error_message'],
                  testCount: 1,
                  warnCount: 0,
                },
                field_5: {
                  errorCount: 0,
                  testCount: 1,
                  warnCount: 0,
                },
              },
              warnCount: 0,
            });
            done();
          });
      });
    });
  });
});
