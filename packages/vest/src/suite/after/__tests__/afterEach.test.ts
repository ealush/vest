import { makeBrand } from 'vest-utils';
import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { TFieldName } from '../../../suiteResult/SuiteResultTypes';
import { dummyTest } from '../../../testUtils/testDummy';
import * as vest from '../../../vest';

describe('afterEach', () => {
  describe('When no async tests', () => {
    it('should call the afterEach callback immediately once', async () => {
      const afterCallback = vi.fn();

      const suite = vest.create(() => {
        dummyTest.passing();
        dummyTest.passing();
        dummyTest.failing();
        dummyTest.failing();
        dummyTest.passing();
        dummyTest.failingWarning('field_2');
      });

      const res = suite.afterEach(afterCallback).run();

      expect(afterCallback).toHaveBeenCalledOnce();

      await res;
      expect(afterCallback).toHaveBeenCalledOnce();
      expect(afterCallback.mock.calls[0][0]).toEqual(suite.get());
    });
  });

  describe('When both sync and async tests', () => {
    it('should call the `afterEach` callback once when the sync tests are done and again for each async test', async () => {
      const control = vi.fn();
      let suite: ReturnType<typeof vest.create>;
      const afterCallback = vi.fn((res: ReturnType<typeof suite.get>) => {
        expect(res).toEqual(suite.get());
        control();
      });
      suite = vest.create(() => {
        dummyTest.passing();
        dummyTest.failingAsync('field_1', { time: 10 });
        dummyTest.failingAsync('field_2', { time: 15 });
      });
      suite.afterEach(afterCallback).run();
      expect(afterCallback).toHaveBeenCalledTimes(1);
      expect(control).toHaveBeenCalledTimes(1);

      const res1 = afterCallback.mock.calls[0][0];
      expect(res1).toEqual(suite.get());
      expect(res1.hasErrors()).toBe(false);

      await wait(10);
      expect(afterCallback).toHaveBeenCalledTimes(2);
      expect(control).toHaveBeenCalledTimes(2);

      const res2 = afterCallback.mock.calls[1][0];
      expect(res2).toEqual(suite.get());
      expect(res2.hasErrors('field_1')).toBe(true);

      await wait(10);
      expect(afterCallback).toHaveBeenCalledTimes(3);
      expect(control).toHaveBeenCalledTimes(3);

      const res3 = afterCallback.mock.calls[2][0];
      expect(res3).toEqual(suite.get());
      expect(res3.hasErrors('field_2')).toBe(true);
    });
  });

  describe('When suite lags and callbacks are registered again', () => {
    it('should cancel any pending callback runs and only conclude the most recent ones', async () => {
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

      suite.afterEach(firstCall_1).afterEach(firstCall_2).run();

      await suite.afterEach(secondCall_1).afterEach(secondCall_2).run();
      // the second run canceled the first run callbacks so they only ran once
      expect(firstCall_1).toHaveBeenCalledTimes(1);
      expect(firstCall_2).toHaveBeenCalledTimes(1);

      // the second run callbacks ran twice because they also ran for the async tests
      expect(secondCall_1).toHaveBeenCalledTimes(2);
      expect(secondCall_2).toHaveBeenCalledTimes(2);
    });
  });

  describe('When there are async tests', () => {
    it('should run after each async test finishes', async () => {
      const afterCallback = vi.fn();
      expect(afterCallback).toHaveBeenCalledTimes(0);
      const res = vest
        .create(() => {
          dummyTest.passingAsync('field_1', { time: 0 });
          dummyTest.failingAsync('field_2', { time: 20 });
          dummyTest.passingAsync('field_3', { time: 40 });
          dummyTest.failing();
          dummyTest.passing();
        })
        .afterEach(afterCallback)
        .run();

      expect(afterCallback).toHaveBeenCalledTimes(1);
      await wait(0);
      expect(afterCallback).toHaveBeenCalledTimes(2);
      await wait(20);
      expect(afterCallback).toHaveBeenCalledTimes(3);

      await wait(40);
      expect(afterCallback).toHaveBeenCalledTimes(4);

      await res;
      expect(afterCallback).toHaveBeenCalledTimes(4);
    });
  });

  describe('When no tests are run', () => {
    it('should run the callback', () => {
      const cb = vi.fn();

      const suite = vest.create(() => {});

      suite.afterEach(cb).run();

      expect(cb).toHaveBeenCalled();
    });

    describe('When tests are omitted', () => {
      it('should run the callback', () => {
        const cb = vi.fn();
        const f1 = makeBrand<TFieldName>('f1');

        const suite = vest.create(() => {
          vest.optional({ f1: true });

          vest.test(f1, () => {});
        });

        suite.afterEach(cb).run();
        expect(suite.get().tests[f1].testCount).toBe(0);
        expect(cb).toHaveBeenCalled();
      });
    });
  });

  describe('Async Isolate', () => {
    describe('When async isolate is pending', () => {
      it('should call the callback for the sync run completion only', async () => {
        const cb = vi.fn();

        const suite = vest.create(() => {
          vest.test('f1', () => false);

          vest.test('f2', async () => {
            await wait(100);
            throw new Error();
          });
        });

        const res = suite.afterEach(cb).run();

        expect(cb).toHaveBeenCalledOnce();

        await res;
        expect(cb).toHaveBeenCalledTimes(2);
      });
    });

    describe('When async isolate is completed', () => {
      it('should call the callback', async () => {
        const cb = vi.fn();

        const suite = vest.create(() => {
          vest.test('test', () => false);

          vest.group('group', async () => {
            await wait(100);
          });
        });

        suite.afterEach(cb).run();
        await wait(100);
        expect(cb).toHaveBeenCalled();
      });
    });
  });
});

describe('suite resolve', () => {
  it('should immediately return all sync fields', () => {
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
    it('should resolve when all tests finish and afterEach() runs', async () => {
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
