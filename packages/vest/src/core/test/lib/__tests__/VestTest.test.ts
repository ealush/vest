import * as vest from 'vest';
import wait from 'wait';

import VestTest from 'VestTest';
import { setPending } from 'pending';
import { usePending, useLagging } from 'stateHooks';

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
    it('Should set `.isWarning` to true', () => {
      expect(testObject.isWarning).toBe(false);
      testObject.warn();
      expect(testObject.isWarning).toBe(true);
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

    it('Should set this.failed to true', () => {
      expect(testObject.failed).toBe(false);
      testObject.fail();
      expect(testObject.failed).toBe(true);
    });
  });

  describe('testobject.valueOf', () => {
    test('When `failed` is false', () => {
      expect(testObject.failed).toBe(false);
      expect(testObject.valueOf()).toBe(true);
    });

    test('When `failed` is true', () => {
      testObject.failed = true;
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

    it.withContext('Should remove a testObject from the pending state', () => {
      setPending(testObject);
      {
        const [pending] = usePending();
        expect(pending).toEqual(expect.arrayContaining([testObject]));
      }
      testObject.cancel();
      {
        const [pending] = usePending();
        expect(pending).toEqual(expect.not.arrayContaining([testObject]));
      }
    });

    it.withContext('Should remove a testObject from the lagging state', () => {
      const [, setLagging] = useLagging();
      setLagging(() => [testObject]);
      {
        const [lagging] = useLagging();
        expect(lagging).toEqual(expect.arrayContaining([testObject]));
      }
      testObject.cancel();
      {
        const [lagging] = useLagging();
        expect(lagging).toEqual(expect.not.arrayContaining([testObject]));
      }
    });
  });
});
