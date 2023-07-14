import { noop } from 'vest-utils';
import wait from 'wait';

import { TestPromise } from '../../../../testUtils/testPromise';

import { IsolateTest, TIsolateTest } from 'IsolateTest';
import { VestTestInspector } from 'VestTestInspector';
import { VestTestMutator } from 'VestTestMutator';
import * as vest from 'vest';

const fieldName = 'unicycle';
const message = 'I am Root.';

describe('IsolateTest', () => {
  let testObject: TIsolateTest;

  beforeEach(() => {
    testObject = IsolateTest(noop, {
      fieldName,
      testFn: jest.fn(),
      message,
    });
  });

  test('TestObject constructor', () => {
    expect(testObject).toMatchSnapshot();
  });

  it('Should have a unique id', () => {
    Array.from({ length: 100 }, () =>
      IsolateTest(noop, {
        fieldName,
        testFn: jest.fn(),
        message,
      })
    ).reduce((existing, { id }) => {
      expect(existing.has(id)).toBe(false);
      existing.add(id);
      return existing;
    }, new Set<string>());
  });

  describe('testObject.warn', () => {
    it('Should mark the test as warning', () => {
      expect(VestTestInspector.warns(testObject)).toBe(false);
      VestTestMutator.warn(testObject);
      expect(VestTestInspector.warns(testObject)).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      jest.resetModules();

      const { IsolateTest } = require('IsolateTest'); // eslint-disable-line @typescript-eslint/no-var-requires
      testObject = IsolateTest(noop, fieldName, jest.fn(), { message });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should set status to failed', () => {
      expect(VestTestInspector.isFailing(testObject)).toBe(false);
      VestTestMutator.fail(testObject);
      expect(VestTestInspector.isFailing(testObject)).toBe(true);
    });
  });

  describe('testObject.valueOf', () => {
    test('When test did not fail', () => {
      expect(testObject.valueOf()).toBe(true);
    });

    test('When test failed', () => {
      VestTestMutator.fail(testObject);
      expect(testObject.valueOf()).toBe(false);
    });
  });

  describe('testObject.cancel', () => {
    it('Should set the testObject to cancel', () => {
      let testObject: IsolateTest;
      return TestPromise(done => {
        const suite = vest.create(() => {
          testObject = vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          VestTestMutator.cancel(testObject);
        });
        suite();

        expect(VestTestInspector.isCanceled(testObject)).toBe(true);
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
          VestTestMutator.fail(testObject);
          expect(VestTestInspector.isFailing(testObject)).toBe(true);
          VestTestMutator.skip(testObject);
          expect(VestTestInspector.isSkipped(testObject)).toBe(false);
          expect(VestTestInspector.isFailing(testObject)).toBe(true);
          VestTestMutator.cancel(testObject);
          expect(VestTestInspector.isCanceled(testObject)).toBe(false);
          expect(VestTestInspector.isFailing(testObject)).toBe(true);
          VestTestMutator.setPending(testObject);
          expect(VestTestInspector.isPending(testObject)).toBe(false);
          expect(VestTestInspector.isFailing(testObject)).toBe(true);
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
          VestTestMutator.cancel(testObject);
          expect(VestTestInspector.isCanceled(testObject)).toBe(true);
          VestTestMutator.fail(testObject);
          expect(VestTestInspector.isCanceled(testObject)).toBe(true);
          expect(VestTestInspector.isFailing(testObject)).toBe(false);
          VestTestMutator.skip(testObject);
          expect(VestTestInspector.isSkipped(testObject)).toBe(false);
          expect(VestTestInspector.isCanceled(testObject)).toBe(true);
          VestTestMutator.setPending(testObject);
          expect(VestTestInspector.isPending(testObject)).toBe(false);
          expect(VestTestInspector.isCanceled(testObject)).toBe(true);
          control();
        })();
        expect(control).toHaveBeenCalledTimes(1);
      });
    });
  });
});
