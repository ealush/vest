import wait from 'wait';

import itWithContext from '../../../../testUtils/itWithContext';

import VestTest from 'VestTest';
import { useAllIncomplete, useTestObjects } from 'stateHooks';
import * as vest from 'vest';

const fieldName = 'unicycle';
const message = 'I am Root.';

describe('VestTest', () => {
  let testObject;

  beforeEach(() => {
    testObject = new VestTest(fieldName, jest.fn(), {
      message,
    });
  });

  test('TestObject constructor', () => {
    expect(testObject).toMatchSnapshot();
  });

  it('Should have a unique id', () => {
    Array.from(
      { length: 100 },
      () => new VestTest(fieldName, jest.fn(), { message })
    ).reduce((existing, { id }) => {
      expect(existing[id]).toBeUndefined();
      existing[id] = true;
      return existing;
    }, {});
  });

  describe('testObject.warn', () => {
    it('Should set `.warns` to true', () => {
      expect(testObject.warns).toBe(false);
      testObject.warn();
      expect(testObject.warns).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      jest.resetModules();

      const VestTest = require('VestTest').default; // eslint-disable-line @typescript-eslint/no-var-requires
      testObject = new VestTest(fieldName, jest.fn(), { message });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should set status to failed', () => {
      expect(testObject.status).not.toBe('FAILED');
      testObject.fail();
      expect(testObject.status).toBe('FAILED');
    });
  });

  describe('testObject.valueOf', () => {
    test('When test did not fail', () => {
      expect(testObject.valueOf()).toBe(true);
    });

    test('When test failed', () => {
      testObject.fail();
      expect(testObject.valueOf()).toBe(false);
    });
  });

  describe('testObject.cancel', () => {
    it('Should remove a testObject from the state', () => {
      return new Promise<void>(done => {
        let testObject: VestTest;
        const suite = vest.create(() => {
          testObject = vest.test('f1', async () => {
            await wait(100);
          });
          vest.test('f2', async () => {
            await wait(100);
          });
          testObject.cancel();
        });
        suite();
        expect(suite.get().tests.f1).toBeUndefined();
        expect(suite.get().tests.f2).toBeDefined();
        done();
      });
    });

    itWithContext('Should be removed from the list of incomplete tests', () => {
      const [, setTestObjects] = useTestObjects();
      setTestObjects(testObjects => testObjects.concat(testObject));
      testObject.setPending();
      {
        const allIncomplete = useAllIncomplete();

        expect(allIncomplete).toEqual(expect.arrayContaining([testObject]));
      }
      testObject.cancel();
      {
        const allIncomplete = useAllIncomplete();
        expect(allIncomplete).toEqual(expect.not.arrayContaining([testObject]));
      }
    });

    describe('final statuses', () => {
      let testObject, fn;
      beforeEach(() => {
        fn = jest.fn();
        testObject = new VestTest('field', fn);
      });
      itWithContext('keep status unchanged when `failed`', () => {
        testObject.fail();
        expect(testObject.isFailing()).toBe(true);
        testObject.skip();
        expect(testObject.isSkipped()).toBe(false);
        expect(testObject.isFailing()).toBe(true);
        testObject.cancel();
        expect(testObject.isCanceled()).toBe(false);
        expect(testObject.isFailing()).toBe(true);
        testObject.setPending();
        expect(testObject.isPending()).toBe(false);
        expect(testObject.isFailing()).toBe(true);
      });

      itWithContext('keep status unchanged when `canceled`', () => {
        testObject.setStatus('CANCELED');
        expect(testObject.isCanceled()).toBe(true);
        testObject.fail();
        expect(testObject.isCanceled()).toBe(true);
        expect(testObject.isFailing()).toBe(false);
        testObject.skip();
        expect(testObject.isSkipped()).toBe(false);
        expect(testObject.isCanceled()).toBe(true);
        testObject.setPending();
        expect(testObject.isPending()).toBe(false);
        expect(testObject.isCanceled()).toBe(true);
      });
    });
  });
});
