import wait from 'wait';

import { dummyTest } from '../../../testUtils/testDummy';
import { TestPromise } from '../../../testUtils/testPromise';

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

  describe('When suite lags and callbacks are registered again', () => {
    it('should only run most recent registered callbacks', async () => {
      const test = [];
      const suite = vest.create(() => {
        test.push(dummyTest.failingAsync('test', { time: 100 }));
      });

      const doneCallback1 = jest.fn();
      const fieldDoneCallback1 = jest.fn();
      const doneCallback2 = jest.fn();
      const fieldDoneCallback2 = jest.fn();

      suite().done(doneCallback1).done('test', fieldDoneCallback1);
      await wait(10);
      suite().done(doneCallback2).done('test', fieldDoneCallback2);
      await wait(100);
      expect(doneCallback2).toHaveBeenCalledTimes(1);
      expect(fieldDoneCallback2).toHaveBeenCalledTimes(1);
      expect(doneCallback1).toHaveBeenCalledTimes(0);
      expect(fieldDoneCallback1).toHaveBeenCalledTimes(0);
    });
  });

  describe('When there are async tests', () => {
    describe('When field name is not passed', () => {
      it('Should run the done callback after all the fields finished running', () => {
        const check1 = jest.fn();
        const check2 = jest.fn();
        const check3 = jest.fn();
        return TestPromise(done => {
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
      return TestPromise(done => {
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
            expect(res.getErrors()).toEqual({
              field_1: ['error message'],
            });
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

  describe('When a different field is run while a field is pending', () => {
    it('Should wait running done callbacks until all tests complete', () => {
      const suite = vest.create(only => {
        vest.only(only);

        vest.test('async_1', async () => {
          await wait(1000);
          throw new Error();
        });

        vest.test('sync_2', () => false);
      });

      suite('async_1');

      return TestPromise(done => {
        suite('sync_2').done(res => {
          expect(res.hasErrors('async_1')).toBe(true);
          done();
        });
      });
    });
  });

  describe('When suite re-runs and a pending test is now skipped', () => {
    it('Should immediately call the second done callback, omit the first', async () => {
      const done_0 = jest.fn();
      const done_1 = jest.fn();

      const suite = vest.create(username => {
        vest.test('username', () => {
          vest.enforce(username).isNotBlank();
        });

        vest.skipWhen(suite.get().hasErrors('username'), () => {
          vest.test('username', async () => {
            await wait(1000);
            if (username === 'ealush') {
              throw new Error();
            }
          });
        });
      });

      suite('ealush').done(done_0);
      await wait(0);
      expect(done_0).not.toHaveBeenCalled();
      suite('').done(done_1);
      expect(done_0).not.toHaveBeenCalled();
      expect(done_1).toHaveBeenCalled();
      await wait(1000);
      expect(done_0).not.toHaveBeenCalled();
    });
  });

  describe('Passing a field that does not exist', () => {
    it('Should avoid calling the callback', () => {
      const cb = jest.fn();

      const suite = vest.create(() => {
        vest.test('test', () => {});
      });

      suite().done('non-existent', cb);

      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('When no tests are run', () => {
    it('Should avoid calling the callback', () => {
      const cb = jest.fn();

      const suite = vest.create(() => {});

      suite().done(cb);

      expect(cb).not.toHaveBeenCalled();
    });
  });

  describe('When focused done call does not match executed tests', () => {
    it('Should not call the callback', () => {
      const cb = jest.fn();

      const suite = vest.create(() => {
        vest.test('test', () => false);
      });

      suite().done('non-existent', cb);

      expect(cb).not.toHaveBeenCalled();
    });
  });
});
