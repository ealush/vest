import { describe, it, expect, beforeEach, test, vi } from 'vitest';
import wait from 'wait';

import { TestPromise } from '../../../testUtils/testPromise';
import { mockIsolateTest } from '../../../testUtils/vestMocks';
import * as vest from '../../../vest';
import { TIsolateTest } from '../../isolate/IsolateTest/IsolateTest';
import { VestTest } from '../../isolate/IsolateTest/VestTest';

const fieldName = 'unicycle';
const message = 'I am Root.';

describe('IsolateTest', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = mockIsolateTest({
      fieldName,
      message,
    });
  });

  test('TestObject constructor', () => {
    expect(testObject).toMatchSnapshot();
  });

  describe('testObject.warn', () => {
    it('Should mark the test as warning', () => {
      expect(VestTest.warns(testObject).unwrap()).toBe(false);
      VestTest.warn(testObject);
      expect(VestTest.warns(testObject).unwrap()).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      testObject = mockIsolateTest({ fieldName, message });
    });

    it('Should set status to failed', () => {
      expect(VestTest.isFailing(testObject).unwrap()).toBe(false);
      VestTest.fail(testObject);
      expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
    });
  });

  describe('testObject.cancel', () => {
    it('Should set the testObject to cancel', () => {
      let testObject: TIsolateTest;
      return TestPromise(done => {
        const suite = vest.create(() => {
          testObject = vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          VestTest.cancel(testObject);
        });
        suite.run();

        expect(VestTest.isCanceled(testObject).unwrap()).toBe(true);
        done();
      });
    });

    describe('final statuses', () => {
      const control = vi.fn();
      beforeEach(() => {
        vi.resetAllMocks();
      });
      it('keep status unchanged when `failed`', () => {
        vest
          .create(() => {
            // async so it is not a final status
            const testObject = vest.test('f1', async () => {
              await wait(100);
            });
            VestTest.fail(testObject);
            expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
            VestTest.skip(testObject);
            expect(VestTest.isSkipped(testObject).unwrap()).toBe(false);
            expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
            VestTest.cancel(testObject);
            expect(VestTest.isCanceled(testObject).unwrap()).toBe(false);
            expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
            VestTest.setPending(testObject);
            expect(VestTest.isPending(testObject)).toBe(false);
            expect(VestTest.isFailing(testObject).unwrap()).toBe(true);
            control();
          })
          .run();
        expect(control).toHaveBeenCalledTimes(1);
      });

      it('keep status unchanged when `canceled`', () => {
        vest
          .create(() => {
            // async so it is not a final status
            const testObject = vest.test('f1', async () => {
              await wait(100);
            });
            VestTest.cancel(testObject);
            expect(VestTest.isCanceled(testObject).unwrap()).toBe(true);
            VestTest.fail(testObject);
            expect(VestTest.isCanceled(testObject).unwrap()).toBe(true);
            expect(VestTest.isFailing(testObject).unwrap()).toBe(false);
            VestTest.skip(testObject);
            expect(VestTest.isSkipped(testObject).unwrap()).toBe(false);
            expect(VestTest.isCanceled(testObject).unwrap()).toBe(true);
            VestTest.setPending(testObject);
            expect(VestTest.isPending(testObject)).toBe(false);
            expect(VestTest.isCanceled(testObject).unwrap()).toBe(true);
            control();
          })
          .run();
        expect(control).toHaveBeenCalledTimes(1);
      });
    });
  });
});
