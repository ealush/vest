import { VestTest } from 'VestTest';
import * as vest from 'vest';
import wait from 'wait';

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
    it('Should mark the test as warning', () => {
      expect(testObject.warns()).toBe(false);
      testObject.warn();
      expect(testObject.warns()).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      jest.resetModules();

      const { VestTest } = require('VestTest'); // eslint-disable-line @typescript-eslint/no-var-requires
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
    it('Should set the testObject to cancel', () => {
      let testObject: VestTest;
      return new Promise<void>(done => {
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

        expect(testObject.isCanceled()).toBe(true);
        done();
      });
    });

    // FIXME: This is a low quality test that relies on implementation details.
    // It should probably be someplace else, related to the running of test
    // and not of the test object itself
    // it.skip('Should be removed from the list of incomplete tests', () => {
    //   const control = jest.fn();
    //   vest.create(() => {
    //     const testObject = vest.test('f1', async () => {
    //       await wait(100);
    //     });

    //     expect(testObject.isPending()).toBe(true);
    //     {
    //       const allIncomplete = useAllIncomplete();

    //       expect(allIncomplete).toEqual(expect.arrayContaining([testObject]));
    //     }
    //     testObject.cancel();
    //     {
    //       const allIncomplete = useAllIncomplete();
    //       expect(allIncomplete).toEqual(
    //         expect.not.arrayContaining([testObject])
    //       );
    //     }
    //     control();
    //   })();
    //   expect(control).toHaveBeenCalledTimes(1);
    // });

    describe('final statuses', () => {
      let control;
      beforeEach(() => {
        control = jest.fn();
      });
      it('keep status unchanged when `failed`', () => {
        vest.create(() => {
          // async so it is not a final status
          const testObject = vest.test('f1', async () => {
            await wait(100);
          });
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
          control();
        })();
        expect(control).toHaveBeenCalledTimes(1);
      });
    });
  });
});
