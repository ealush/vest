import runCreateRef from '../../../../../testUtils/runCreateRef';

import VestTest from 'VestTest';
import addTestToState from 'addTestToState';
import context from 'ctx';
import { setPending } from 'pending';
import { usePending, useTestObjects, useLagging } from 'stateHooks';


const fieldName = 'unicycle';
const message = 'I am Root.';

let stateRef;

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

      const VestTest = require('VestTest').default;
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
    const getCtx = () => ({ stateRef });

    beforeEach(() => {
      stateRef = runCreateRef();

      context.run({ stateRef }, () => {
        addTestToState(testObject);
      });
    });

    it.withContext(
      'Should remove a testObject from the state',
      () => {
        const [testObjects] = useTestObjects();
        expect(testObjects).toEqual(expect.arrayContaining([testObject]));
        testObject.cancel();
        expect(testObjects).toEqual(expect.not.arrayContaining([testObject]));
      },
      getCtx
    );

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
