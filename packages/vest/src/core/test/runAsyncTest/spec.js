import _ from 'lodash';
import runCreateRef from '../../../../testUtils/runCreateRef';
import context from '../../context';
import useTestCallbacks from '../../produce/useTestCallbacks';
import VestTest from '../lib/VestTest';
import { setPending } from '../lib/pending';
import usePending from '../lib/pending/usePending';
import runAsyncTest from '.';

const STATEMENT = 'some statement string';

const CASE_PASSING = 'passing';
const CASE_FAILING = 'failing';

let stateRef;

it.ctx = (str, cb) => it(str, () => context.run({ stateRef }, cb));

describe.each([CASE_PASSING /*, CASE_FAILING*/])(
  'runAsyncTest: %s',
  testCase => {
    let testObject, fieldName;

    const runRunAsyncTest = (...args) =>
      context.run(
        {
          stateRef,
        },
        () => runAsyncTest(...args)
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
      testObject = new VestTest({
        fieldName,
        statement: STATEMENT,
        testFn: () => null,
      });
      testObject.asyncTest =
        testCase === CASE_PASSING ? Promise.resolve() : Promise.reject();
      context.run({ stateRef }, () => {
        setPending(testObject);
      });
    });

    describe('State updates', () => {
      it.ctx('Initial state matches snapshot (sanity)', () => {
        const [pendingState] = usePending();
        expect(pendingState.pending).toContain(testObject);
        expect(stateRef.current()).toMatchSnapshot();
        runRunAsyncTest(testObject);
      });

      it('Should remove test from pending array', () =>
        new Promise(done => {
          runRunAsyncTest(testObject);
          setTimeout(
            context.bind({ stateRef }, () => {
              const [pendingState] = usePending();
              expect(pendingState.pending).not.toContain(testObject);
              done();
            })
          );
        }));

      describe('When test is canceled', () => {
        beforeEach(() => {
          testObject.cancel();
        });

        it.ctx('Should remove test from pending array', () => {
          const [pendingState] = usePending();
          expect(pendingState.pending).toEqual(
            expect.arrayContaining([testObject])
          );
          runRunAsyncTest(testObject);
          return new Promise(done => {
            setTimeout(() => {
              expect(pendingState).toEqual(
                expect.not.arrayContaining([testObject])
              );
              done();
            });
          });
        });
      });
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
          new Promise(done => {
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
            setPending(
              new VestTest({
                fieldName: 'pending_field',
                statement: STATEMENT,
                testFn: jest.fn(),
              })
            );
          });
        });

        it("Should only run current field's callbacks", () =>
          new Promise(done => {
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
          testObject.cancel();
        });

        it('Should return without running any callback', () =>
          new Promise(done => {
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
        it('Should keep test object unchanged', () =>
          new Promise(done => {
            runRunAsyncTest(testObject);
            setTimeout(() => {
              expect(testObject).toEqual(testObjectCopy);
              done();
            });
          }));

        it('Should return without calling testObject.fail', () =>
          new Promise(done => {
            runRunAsyncTest(testObject);
            setTimeout(() => {
              expect(testObject.fail).not.toHaveBeenCalled();
              done();
            });
          }));
      }

      if (testCase === CASE_FAILING) {
        it('Should call testObject.fail', () =>
          new Promise(done => {
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

          it('Should set test statement to rejection string', () =>
            new Promise(done => {
              runRunAsyncTest(testObject);
              setTimeout(() => {
                expect(testObject.statement).toBe(rejectionString);
                done();
              });
            }));
        });
      }
    });
  }
);
