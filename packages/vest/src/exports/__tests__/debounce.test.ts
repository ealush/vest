import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { TestFnPayload } from 'TestTypes';
import debounce from 'debounce';
import * as vest from 'vest';

describe('debounce', () => {
  describe('Sync test', () => {
    describe('Returning false', () => {
      it('should debounce test function calls when returning false', async () => {
        const test = vi.fn(() => {
          return false;
        });

        const suite = vest.create(() => {
          vest.test('test', 'message', debounce(test, 1500));
        });

        suite.run();
        suite.run();
        suite.run();
        suite.run();
        suite.run();
        suite.run();
        await suite.run();
        expect(test).toHaveBeenCalledTimes(1);
        expect(suite.isValid()).toBe(false);
      });
    });

    describe('Throwing an error', () => {
      it('should debounce test function calls when throwing an error', async () => {
        const test = vi.fn(() => {
          throw new Error();
        });

        const suite = vest.create(() => {
          vest.test('test', 'message', debounce(test, 1500));
        });

        suite.run();
        suite.run();
        suite.run();
        suite.run();
        suite.run();
        suite.run();
        await suite.run();
        expect(test).toHaveBeenCalledTimes(1);
        expect(suite.isValid()).toBe(false);
      });
    });
  });

  describe('Async test', () => {
    it('should start the async test only after the debounce delay', async () => {
      const t = vi.fn(async () => {
        await wait(1000);
        vest.enforce(1).equals(2);
      });

      const suite = vest.create(() => {
        vest.test('test', 'message', debounce(t, 1500));
      });

      suite.run();
      expect(t).toHaveBeenCalledTimes(0);
      expect(suite.isPending()).toBe(true);
      await wait(2000);
      expect(t).toHaveBeenCalledTimes(1);
      expect(suite.get().hasErrors('test')).toBe(false);
      expect(suite.isPending()).toBe(true);
      await wait(1000);
      expect(suite.isPending()).toBe(false);
      expect(suite.get().hasErrors('test')).toBe(true);
    });
  });

  describe('When delay met multiple times', () => {
    it('should call the test once per completed delay window', async () => {
      const test = vi.fn(() => {
        return false;
      });

      const suite = vest.create(() => {
        vest.test('test', 'message', debounce(test, 1000));
      });

      suite.run();
      await wait(1000);
      expect(suite.get().hasErrors('test')).toBe(true);
      expect(test).toHaveBeenCalledTimes(1);

      suite.run();
      suite.run();
      suite.run();
      expect(test).toHaveBeenCalledTimes(1);
      await wait(1000);
      expect(suite.get().hasErrors('test')).toBe(true);
      expect(test).toHaveBeenCalledTimes(2);

      suite.run();
      suite.run();
      suite.run();
      expect(test).toHaveBeenCalledTimes(2);
      await wait(1000);
    });
  });

  describe('Debounced tests with non-debounced tests', () => {
    it('should complete non-debounced tests immediately', async () => {
      const test = vi.fn(() => {
        return false;
      });

      const suite = vest.create(() => {
        vest.test('test', 'message', debounce(test, 100));
        vest.test('test2', 'message', test);
      });

      const suitePromise = suite.run();
      expect(test).toHaveBeenCalledTimes(1);
      expect(suite.get().hasErrors('test')).toBe(false);
      expect(suite.get().hasErrors('test2')).toBe(true);
      await suitePromise;
      expect(test).toHaveBeenCalledTimes(2);
      expect(suite.get().hasErrors('test')).toBe(true);
      expect(suite.get().hasErrors('test2')).toBe(true);
    });
  });

  describe('Multiple debounced fields', () => {
    it('should conclude each debounced field on its own schedule', async () => {
      const calls: number[] = [];
      const t = vi.fn(() => {
        calls.push(Date.now());
        return false;
      });

      const suite = vest.create(() => {
        vest.test('test', 'message', debounce(t, 100));
        vest.test('test2', 'message', debounce(t, 200));
        vest.test('test3', 'message', debounce(t, 300));
      });

      await suite.run();
      expect(t).toHaveBeenCalledTimes(3);
      expect(calls[0]).toBeLessThan(calls[1]);
      expect(calls[1]).toBeLessThan(calls[2]);
      expect(calls[1] - calls[0]).toBeGreaterThanOrEqual(90);
      expect(calls[2] - calls[1]).toBeGreaterThanOrEqual(90);
      expect(suite.get().hasErrors('test')).toBe(true);
      expect(suite.get().hasErrors('test2')).toBe(true);
      expect(suite.get().hasErrors('test3')).toBe(true);
    });
  });

  describe('Test payload', () => {
    describe('AbortSignal', () => {
      it('should abort the test when the abort signal is triggered', async () => {
        const control = vi.fn();

        let run = 0;
        const test = vi.fn(async (payload: TestFnPayload) => {
          expect(payload.signal.aborted).toBe(false);
          await wait(50);
          // We should only abort on the first run because
          // the second run is canceling the firt, but nothing
          // cancels the second.
          expect(payload.signal.aborted).toBe(run === 0);
          control();
          return true;
        });

        const suite = vest.create(() => {
          vest.test('test', 'message', debounce(test, 200));
          run++;
        });

        suite.run();
        await wait(200);
        // This cancels the first run
        await suite.run();
        expect(suite.hasErrors('test')).toBe(false);
        expect(test).toHaveBeenCalledTimes(2);
        expect(control).toHaveBeenCalledTimes(1);
      });
    });
  });
});
