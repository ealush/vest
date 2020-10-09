import _ from 'lodash';
import runCreateRef from '../../../../../testUtils/runCreateRef';
import context from '../../../context';
import VestTest from '../VestTest';
import usePending from './usePending';
import { removePending, setPending } from '.';

const groupName = 'group_name';

let stateRef;

it.ctx = (str, cb) => it(str, () => context.run({ stateRef }, cb));
beforeEach.ctx = cb => beforeEach(() => context.run({ stateRef }, cb));

describe('module: pending', () => {
  let currentState, testObject;

  const runRemovePending = testObject => {
    context.run({ stateRef }, () => removePending(testObject));
  };

  beforeEach(() => {
    stateRef = runCreateRef();
    currentState = _.cloneDeep(stateRef.current());
    testObject = new VestTest({
      fieldName: 'field_1',
      statement: 'failure_message',
      testFn: jest.fn(),
    });
  });
  describe('export: removePending', () => {
    describe('When testObject it not pending or lagging', () => {
      it('Should keep state unchanged', () => {
        runRemovePending(testObject);
        expect(stateRef.current()).toEqual(currentState);
      });
    });

    describe('When testObject is either pending or lagging', () => {
      describe('When in pending', () => {
        beforeEach.ctx(() => {
          const [, setPending] = usePending();

          setPending(state => {
            state.pending = state.pending.concat(testObject);
            return state;
          });
        });

        it.ctx('Should remove test from pending', () => {
          {
            const [pendingState] = usePending();
            expect(pendingState.pending).toContain(testObject);
          }
          runRemovePending(testObject);
          {
            const [pendingState] = usePending();
            expect(pendingState.pending).not.toContain(testObject);
          }
          expect(stateRef.current()).toMatchSnapshot();
        });
      });
      describe('When in lagging', () => {
        beforeEach.ctx(() => {
          const [, setPending] = usePending();

          setPending(state => {
            state.lagging = state.lagging.concat(testObject);
            return state;
          });
        });

        it.ctx('Should remove test from lagging', () => {
          {
            const [pendingState] = usePending();
            expect(pendingState.lagging).toContain(testObject);
          }
          runRemovePending(testObject);
          {
            const [pendingState] = usePending();
            expect(pendingState.lagging).not.toContain(testObject);
          }
          expect(stateRef.current()).toMatchSnapshot();
        });
      });
    });
  });

  describe('export: setPending', () => {
    let testObjects;

    beforeEach(() => {
      testObjects = Array.from(
        { length: 5 },
        (v, i) =>
          new VestTest({
            fieldName: `test_${i}`,
            statement: 'Some statement string',
            testFn: jest.fn(),
          })
      );
      testObjects[0].groupName = groupName;
    });

    it.ctx('Should set supplied test object as pending', () => {
      {
        const [pendingState] = usePending();
        expect(pendingState.pending).not.toContain(testObjects[0]);
      }
      setPending(testObjects[0]);
      {
        const [pendingState] = usePending();
        expect(pendingState.pending).toContain(testObjects[0]);
      }
      expect(stateRef.current()).toMatchSnapshot();
    });

    describe('When a field of the same profile is in lagging array', () => {
      beforeEach.ctx(() => {
        const [, setPending] = usePending();

        setPending(state => {
          state.lagging = state.lagging.concat(
            testObjects[2], // same fieldName, group = undefined
            testObjects[0], // same fieldName, group = group_name
            testObjects[1] // same fieldName, group = undefined
          );

          return state;
        });
      });

      it.ctx('Should remove test from lagging array', () => {
        {
          const [pendingState] = usePending();
          expect(pendingState.lagging).toContain(testObjects[0]);
        }
        setPending(testObjects[0]);
        {
          const [pendingState] = usePending();
          expect(pendingState.lagging).not.toContain(testObjects[0]);
        }
        expect(stateRef.current()).toMatchSnapshot();
      });

      it.ctx('Should add test to pending array', () => {
        {
          const [pendingState] = usePending();
          expect(pendingState.pending).not.toContain(testObjects[0]);
        }
        setPending(testObjects[0]);
        {
          const [pendingState] = usePending();
          expect(pendingState.pending).toContain(testObjects[0]);
        }
      });

      it.ctx('Should set test as canceled', () => {
        expect(testObjects[0].canceled).toBeUndefined();
        setPending(testObjects[0]);
        expect(testObjects[0].canceled).toBe(true);
      });
    });
  });
});
