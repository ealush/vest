import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { dummyTest } from '../../../testUtils/testDummy';
import { TestPromise } from '../../../testUtils/testPromise';

import * as vest from 'vest';

describe('after', () => {
  describe('When no async tests', () => {
    it('Should call done callback immediately', () => {
      const doneCallback = vi.fn();
      const fieldDoneCallback = vi.fn();

      vest
        .create(() => {
          dummyTest.passing();
          dummyTest.passing();
          dummyTest.failing();
          dummyTest.failing();
          dummyTest.passing();
          dummyTest.failingWarning('field_2');
        })
        .after(doneCallback)
        .after(fieldDoneCallback)
        .run();

      expect(doneCallback).toHaveBeenCalled();
      expect(fieldDoneCallback).toHaveBeenCalled();
    });
  });

  describe('When suite lags and callbacks are registered again', () => {
    it('should only run most recent registered callbacks', async () => {
      const test = [];
      let count = 0;
      const suite = vest.create(() => {
        test.push(
          dummyTest.failingAsync('test', {
            time: 100,
            message: 'run ' + count++,
          }),
        );
      });

      const firstCall_1 = vi.fn(() => 'a');
      const firstCall_2 = vi.fn(() => 'b');
      const secondCall_1 = vi.fn(() => 'c');
      const secondCall_2 = vi.fn(() => 'd');

      suite.after(firstCall_1).after(firstCall_2).run();
      await wait(10);
      suite.after(secondCall_1).after(secondCall_2).run();
      await wait(100);
      expect(firstCall_1).toHaveBeenCalledTimes(0);
      expect(firstCall_2).toHaveBeenCalledTimes(0);
      expect(secondCall_1).toHaveBeenCalledTimes(1);
      expect(secondCall_2).toHaveBeenCalledTimes(1);
    });
  });

  describe('When there are async tests', () => {
    describe('When field name is not passed', () => {
      it('Should run the done callback after all the fields finished running', () => {
        const check1 = vi.fn();
        const check2 = vi.fn();
        const check3 = vi.fn();
        return TestPromise(done => {
          const doneCallback = vi.fn(() => {
            expect(check1).toHaveBeenCalled();
            expect(check2).toHaveBeenCalled();
            expect(check3).toHaveBeenCalled();
            done();
          });
          vest
            .create(() => {
              dummyTest.passingAsync('field_1', { time: 1000 });
              dummyTest.failingAsync('field_2', { time: 100 });
              dummyTest.passingAsync('field_3', { time: 0 });
              dummyTest.failing();
              dummyTest.passing();
            })
            .after(doneCallback)
            .run();

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

      suite.run('async_1');

      return TestPromise(done => {
        suite
          .after(() => {
            expect(suite.hasErrors('async_1')).toBe(true);
            done();
          })
          .run('sync_2');
      });
    });
  });

  describe('When suite re-runs and a pending test is now skipped', () => {
    it('Should immediately call the second done callback, omit the first', async () => {
      const done_0 = vi.fn();
      const done_1 = vi.fn();

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

      suite.after(done_0).run('ealush');
      await wait(0);
      expect(done_0).not.toHaveBeenCalled();
      suite.after(done_1).run('');
      expect(done_0).not.toHaveBeenCalled();
      expect(done_1).toHaveBeenCalled();
      await wait(1000);
      expect(done_0).not.toHaveBeenCalled();
    });
  });

  describe('When no tests are run', () => {
    it('Should run the callback', () => {
      const cb = vi.fn();

      const suite = vest.create(() => {});

      suite.after(cb).run();

      expect(cb).toHaveBeenCalled();
    });

    describe('When tests are omitted', () => {
      it('Should run the callback', () => {
        const cb = vi.fn();

        const suite = vest.create(() => {
          vest.optional({ f1: true });

          vest.test('f1', () => {});
        });

        suite.after(cb).run();
        expect(suite.get().tests.f1.testCount).toBe(0);
        expect(cb).toHaveBeenCalled();
      });
    });
  });

  describe('Async Isolate', () => {
    describe('When async isolate is pending', () => {
      it('Should not call the callback', () => {
        const cb = vi.fn();

        const suite = vest.create(() => {
          vest.test('test', () => false);

          vest.group('group', async () => {
            await wait(1000);
          });
        });

        suite.after(cb).run();

        expect(cb).not.toHaveBeenCalled();
      });
    });

    describe('When async isolate is completed', () => {
      it('Should call the callback', async () => {
        const cb = vi.fn();

        const suite = vest.create(() => {
          vest.test('test', () => false);

          vest.group('group', async () => {
            await wait(1000);
          });
        });

        suite.after(cb).run();
        await wait(1000);
        expect(cb).toHaveBeenCalled();
      });
    });
  });
});

describe('suite resolve', () => {
  it('Should immediately return all sync fields', () => {
    const suite = vest.create(() => {
      vest.test('field_1', 'field_statement_1', () => false);
      vest.test('field_2', 'field_statement_2', () => false);
      vest.test('field_3', 'field_statement_3', () => false);
    });

    const result = suite.run();

    expect(result.tests).toHaveProperty('field_1');
    expect(result.tests).toHaveProperty('field_2');
    expect(result.tests).toHaveProperty('field_3');
    expect(result.hasErrors('field_1')).toBe(true);
    expect(result.hasErrors('field_2')).toBe(true);
    expect(result.hasErrors('field_3')).toBe(true);
    expect(result.tests).toMatchSnapshot();
  });
  describe('awaiting suite', () => {
    it('Should return a promise that resolves when all tests are done, and the done callback is called', async () => {
      const suite = vest.create(() => {
        vest.test('field_1', 'field_statement_1', async () => {
          await wait(100);
          throw new Error();
        });
        vest.test('field_2', 'field_statement_2', async () => {
          await wait(100);
        });
        vest.test('field_3', 'field_statement_3', async () => {
          await wait(100);
          throw new Error();
        });
      });

      const result = await suite.run();

      expect(result.tests).toHaveProperty('field_1');
      expect(result.tests).toHaveProperty('field_2');
      expect(result.tests).toHaveProperty('field_3');
      expect(result.hasErrors('field_1')).toBe(true);
      expect(result.hasErrors('field_2')).toBe(false);
      expect(result.hasErrors('field_3')).toBe(true);
      expect(result.tests).toMatchSnapshot();
    });
  });
});
