import _ from 'lodash';

import runCreateRef from '../../../../testUtils/runCreateRef';
import { addTestObject } from '../../../../testUtils/testObjects';

import VestTest from 'VestTest';
import context from 'ctx';
import runAsyncTest from 'runAsyncTest';
import { useTestCallbacks } from 'stateHooks';
import { initBus } from 'vestBus';

const message = 'some message string';

const CASE_PASSING = 'passing';
const CASE_FAILING = 'failing';

let stateRef;

describe.each([CASE_PASSING, CASE_FAILING])('runAsyncTest: %s', testCase => {
  let testObject, fieldName, bus;

  beforeEach(() => {
    bus = initBus();
  });

  const runRunAsyncTest = (testObject: VestTest) =>
    context.run(
      {
        stateRef,
        bus,
      },
      () => runAsyncTest(testObject)
    );

  beforeEach(() => {
    fieldName = 'field_1';
    stateRef = runCreateRef();
    context.run({ stateRef }, () => {
      const [, setTestCallbacks] = useTestCallbacks();
      setTestCallbacks(state => {
        state.fieldCallbacks = {
          ...state.fieldCallbacks,
          [fieldName]: state.fieldCallbacks[fieldName] || [],
        };

        return state;
      });
    });
    testObject = new VestTest(fieldName, jest.fn(), {
      message,
    });
    testObject.asyncTest =
      testCase === CASE_PASSING ? Promise.resolve() : Promise.reject();
    context.run({ stateRef }, () => {
      testObject.setPending();
    });
  });

  describe('State updates', () => {
    it('Should remove pending status from test object', () =>
      new Promise<void>(done => {
        expect(testObject.status).toBe('PENDING');
        runRunAsyncTest(testObject);
        setTimeout(
          context.bind({ stateRef }, () => {
            expect(testObject.status).not.toBe('PENDING');
            done();
          })
        );
      }));
  });

  describe('doneCallbacks', () => {
    let fieldCallback_1, fieldCallback_2, doneCallback;
    beforeEach(() => {
      fieldCallback_1 = jest.fn();
      fieldCallback_2 = jest.fn();
      doneCallback = jest.fn();

      context.run({ stateRef }, () => {
        const [, setTestCallbacks] = useTestCallbacks();

        setTestCallbacks(state => ({
          fieldCallbacks: {
            ...state.fieldCallbacks,
            [fieldName]: (state.fieldCallbacks[fieldName] || []).concat(
              fieldCallback_1,
              fieldCallback_2
            ),
          },
          doneCallbacks: state.doneCallbacks.concat(doneCallback),
        }));
      });
    });
    describe('When no remaining tests', () => {
      it('Should run all callbacks', () =>
        new Promise<void>(done => {
          expect(fieldCallback_1).not.toHaveBeenCalled();
          expect(fieldCallback_2).not.toHaveBeenCalled();
          expect(doneCallback).not.toHaveBeenCalled();
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(fieldCallback_1).toHaveBeenCalled();
            expect(fieldCallback_2).toHaveBeenCalled();
            expect(doneCallback).toHaveBeenCalled();
            done();
          });
        }));
    });

    describe('When there are more tests left', () => {
      beforeEach(() => {
        context.run({ stateRef }, () => {
          const pendingTest = new VestTest('pending_field', jest.fn(), {
            message,
          });
          addTestObject(pendingTest);
          pendingTest.setPending();
        });
      });

      it("Should only run current field's callbacks", () =>
        new Promise<void>(done => {
          expect(fieldCallback_1).not.toHaveBeenCalled();
          expect(fieldCallback_2).not.toHaveBeenCalled();
          expect(doneCallback).not.toHaveBeenCalled();
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(fieldCallback_1).toHaveBeenCalled();
            expect(fieldCallback_2).toHaveBeenCalled();
            expect(doneCallback).not.toHaveBeenCalled();
            done();
          });
        }));
    });

    describe('When test is canceled', () => {
      beforeEach(() => {
        context.run({ stateRef }, () => {
          testObject.cancel();
        });
      });

      it('Should return without running any callback', () =>
        new Promise<void>(done => {
          expect(fieldCallback_1).not.toHaveBeenCalled();
          expect(fieldCallback_2).not.toHaveBeenCalled();
          expect(doneCallback).not.toHaveBeenCalled();
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(fieldCallback_1).not.toHaveBeenCalled();
            expect(fieldCallback_2).not.toHaveBeenCalled();
            expect(doneCallback).not.toHaveBeenCalled();
            done();
          });
        }));
    });
  });

  describe('testObject', () => {
    let testObjectCopy;

    beforeEach(() => {
      testObject.fail = jest.fn();
      testObjectCopy = _.cloneDeep(testObject);
    });

    if (testCase === CASE_PASSING) {
      it('Should keep test object unchanged except for status', () =>
        new Promise<void>(done => {
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(testObject).toEqual(
              Object.assign(testObjectCopy, { status: 'PASSING' })
            );
            done();
          });
        }));

      it('Should return without calling testObject.fail', () =>
        new Promise<void>(done => {
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(testObject.fail).not.toHaveBeenCalled();
            done();
          });
        }));
    }

    if (testCase === CASE_FAILING) {
      it('Should call testObject.fail', () =>
        new Promise<void>(done => {
          runRunAsyncTest(testObject);
          setTimeout(() => {
            expect(testObject.fail).toHaveBeenCalled();
            done();
          });
        }));

      describe('When rejecting with a message', () => {
        const rejectionString = 'rejection string';
        beforeEach(() => {
          testObject.asyncTest.catch(Function.prototype);
          testObject.asyncTest = Promise.reject(rejectionString);
        });

        it('Should set test message to rejection string', () =>
          new Promise<void>(done => {
            runRunAsyncTest(testObject);
            setTimeout(() => {
              expect(testObject.message).toBe(rejectionString);
              done();
            });
          }));
      });
    }
  });
});
