import { describe, it, expect, vi, test } from 'vitest';
import wait from 'wait';

import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from '../../../vest';

describe('afterEach - additional test coverage', () => {
  describe('Chaining multiple afterEach callbacks', () => {
    it('should execute multiple chained afterEach callbacks in the order they were added', () => {
      const executionOrder: number[] = [];
      const callback1 = vi.fn(() => {
        executionOrder.push(1);
      });
      const callback2 = vi.fn(() => {
        executionOrder.push(2);
      });
      const callback3 = vi.fn(() => {
        executionOrder.push(3);
      });

      const suite = vest.create(() => {
        dummyTest.passing();
        dummyTest.failing();
      });

      suite
        .afterEach(callback1)
        .afterEach(callback2)
        .afterEach(callback3)
        .run();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
      expect(callback3).toHaveBeenCalledOnce();
      expect(executionOrder).toEqual([1, 2, 3]);
    });
  });

  describe('Return value of afterEach', () => {
    it('should return a runnable', () => {
      const suite = vest.create(() => {
        dummyTest.passing();
      });

      const returnValue = suite.afterEach(() => {});

      expect(typeof returnValue.run).toBe('function');
      expect(typeof returnValue.afterEach).toBe('function');
      expect(typeof returnValue.afterField).toBe('function');
      expect(typeof returnValue.focus).toBe('function');
    });
  });

  describe('Error handling in afterEach callbacks', () => {
    it('should not prevent other callbacks from running when one throws an error', () => {
      const callback1 = vi.fn(() => {
        throw new Error('Test error');
      });
      const callback2 = vi.fn();

      const suite = vest.create(() => {
        dummyTest.passing();
      });

      // We need to catch the error to prevent it from failing the test
      suite.afterEach(callback1).afterEach(callback2).run();

      expect(callback1).toHaveBeenCalledOnce();
      expect(callback2).toHaveBeenCalledOnce();
    });
  });

  describe('Different types of callbacks', () => {
    it('should work with arrow functions', () => {
      const callback = vi.fn(() => 'arrow');

      const suite = vest.create(() => {
        dummyTest.passing();
      });

      suite.afterEach(callback).run();

      expect(callback).toHaveBeenCalledOnce();
      expect(callback).toHaveReturnedWith('arrow');
    });

    it('should work with regular functions', () => {
      function regularCallback() {
        return 'regular';
      }
      const spy = vi.fn(regularCallback);

      const suite = vest.create(() => {
        dummyTest.passing();
      });

      suite.afterEach(spy).run();

      expect(spy).toHaveBeenCalledOnce();
      expect(spy).toHaveReturnedWith('regular');
    });
  });

  describe('afterEach with async tests and multiple callbacks', () => {
    it('should call all callbacks after each async test completes', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      const suite = vest.create(() => {
        dummyTest.passingAsync('field_1', { time: 10 });
        dummyTest.failingAsync('field_2', { time: 20 });
      });

      const result = suite.afterEach(callback1).afterEach(callback2).run();

      // Initial sync run
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      // After first async test
      await wait(15);
      expect(callback1).toHaveBeenCalledTimes(2);
      expect(callback2).toHaveBeenCalledTimes(2);

      // After second async test
      await wait(15);
      expect(callback1).toHaveBeenCalledTimes(3);
      expect(callback2).toHaveBeenCalledTimes(3);

      await result;
    });
  });

  describe('afterEach callback parameters', () => {
    test('should receive the suite result as an argument', () => {
      const callback = vi.fn();

      const suite = vest.create(() => {
        vest.test('field_1', () => {
          vest.enforce('value').isNotEmpty();
        });

        vest.test('field_2', () => {
          throw new Error('Test error');
        });
      });

      suite.afterEach(callback).run();

      expect(callback).toHaveBeenCalledOnce();

      const param = callback.mock.calls[0][0];
      expect(param).toEqual(suite.get());
    });
  });
});
