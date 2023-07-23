import wait from 'wait';

import { TestPromise } from '../../../testUtils/testPromise';

import { TIsolateTest } from 'IsolateTest';
import { VestTest } from 'VestTest';
import * as vest from 'vest';
import { mockIsolateTest } from 'vestMocks';

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
      expect(VestTest.warns(testObject)).toBe(false);
      VestTest.warn(testObject);
      expect(VestTest.warns(testObject)).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      testObject = mockIsolateTest({ fieldName, message });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should set status to failed', () => {
      expect(VestTest.isFailing(testObject)).toBe(false);
      VestTest.fail(testObject);
      expect(VestTest.isFailing(testObject)).toBe(true);
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
        suite();

        expect(VestTest.isCanceled(testObject)).toBe(true);
        done();
      });
    });

    describe('final statuses', () => {
      let control = jest.fn();
      beforeEach(() => {
        control = jest.fn();
      });
      it('keep status unchanged when `failed`', () => {
        vest.create(() => {
          // async so it is not a final status
          const testObject = vest.test('f1', async () => {
            await wait(100);
          });
          VestTest.fail(testObject);
          expect(VestTest.isFailing(testObject)).toBe(true);
          VestTest.skip(testObject);
          expect(VestTest.isSkipped(testObject)).toBe(false);
          expect(VestTest.isFailing(testObject)).toBe(true);
          VestTest.cancel(testObject);
          expect(VestTest.isCanceled(testObject)).toBe(false);
          expect(VestTest.isFailing(testObject)).toBe(true);
          VestTest.setPending(testObject);
          expect(VestTest.isPending(testObject)).toBe(false);
          expect(VestTest.isFailing(testObject)).toBe(true);
          control();
        })();
        expect(control).toHaveBeenCalledTimes(1);
      });

      it('keep status unchanged when `canceled`', () => {
        vest.create(() => {
          // async so it is not a final status
          const testObject = vest.test('f1', async () => {
            await wait(100);
          });
          VestTest.cancel(testObject);
          expect(VestTest.isCanceled(testObject)).toBe(true);
          VestTest.fail(testObject);
          expect(VestTest.isCanceled(testObject)).toBe(true);
          expect(VestTest.isFailing(testObject)).toBe(false);
          VestTest.skip(testObject);
          expect(VestTest.isSkipped(testObject)).toBe(false);
          expect(VestTest.isCanceled(testObject)).toBe(true);
          VestTest.setPending(testObject);
          expect(VestTest.isPending(testObject)).toBe(false);
          expect(VestTest.isCanceled(testObject)).toBe(true);
          control();
        })();
        expect(control).toHaveBeenCalledTimes(1);
      });
    });
  });
});
