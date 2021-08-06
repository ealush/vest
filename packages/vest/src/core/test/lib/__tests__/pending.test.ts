import _ from 'lodash';

import expandStateRef from '../../../../../testUtils/expandStateRef';
import itWithContext from '../../../../../testUtils/itWithContext';
import runCreateRef from '../../../../../testUtils/runCreateRef';

import VestTest from 'VestTest';
import context from 'ctx';
import { removePending, setPending } from 'pending';
import { usePending, useLagging } from 'stateHooks';

const groupName = 'group_name';

let state, stateRef;

const getStateRef = () => ({ stateRef });

function beforeEachWithContext(cb: () => void) {
  beforeEach(() => context.run({ stateRef }, cb));
}
describe('module: pending', () => {
  let refContent, testObject;

  const runRemovePending = testObject => {
    context.run({ stateRef }, () => removePending(testObject));
  };

  beforeEach(() => {
    stateRef = runCreateRef(state);
    refContent = _.cloneDeep(expandStateRef(stateRef));
    testObject = new VestTest('field_1', jest.fn(), {
      message: 'failure_message',
    });
  });
  describe('export: removePending', () => {
    describe('When testObject it not pending or lagging', () => {
      it('Should keep state unchanged', () => {
        runRemovePending(testObject);
        expect(expandStateRef(stateRef)).toEqual(refContent);
      });
    });

    describe('When testObject is either pending or lagging', () => {
      describe('When in pending', () => {
        beforeEachWithContext(() => {
          const [, setPending] = usePending();

          setPending(pending => {
            return pending.concat(testObject);
          });
        });

        itWithContext(
          'Should remove test from pending',
          () => {
            {
              const [pending] = usePending();
              expect(pending).toContain(testObject);
            }
            runRemovePending(testObject);
            {
              const [pending] = usePending();
              expect(pending).not.toContain(testObject);
            }
            expect(expandStateRef(stateRef)).toMatchSnapshot();
          },
          getStateRef
        );
      });
      describe('When in lagging', () => {
        beforeEachWithContext(() => {
          const [, setLaggin] = useLagging();

          setLaggin(lagging => {
            return lagging.concat(testObject);
          });
        });

        itWithContext(
          'Should remove test from lagging',
          () => {
            {
              const [lagging] = useLagging();
              expect(lagging).toContain(testObject);
            }
            runRemovePending(testObject);
            {
              const [lagging] = useLagging();
              expect(lagging).not.toContain(testObject);
            }
            expect(expandStateRef(stateRef)).toMatchSnapshot();
          },
          getStateRef
        );
      });
    });
  });

  describe('export: setPending', () => {
    let testObjects;

    beforeEach(() => {
      testObjects = Array.from(
        { length: 5 },
        (_, i) =>
          new VestTest(`test_${i}`, jest.fn(), {
            message: 'Some statement string',
          })
      );
      testObjects[0].groupName = groupName;
    });

    itWithContext(
      'Should set supplied test object as pending',
      () => {
        {
          const [pending] = usePending();
          expect(pending).not.toContain(testObjects[0]);
        }
        setPending(testObjects[0]);
        {
          const [pending] = usePending();
          expect(pending).toContain(testObjects[0]);
        }
        expect(expandStateRef(stateRef)).toMatchSnapshot();
      },
      getStateRef
    );

    describe('When a field of the same profile is in lagging array', () => {
      beforeEachWithContext(() => {
        const [, setLagging] = useLagging();

        setLagging(lagging => {
          return lagging.concat(
            testObjects[2], // same fieldName, group = undefined
            testObjects[0], // same fieldName, group = group_name
            testObjects[1] // same fieldName, group = undefined
          );
        });
      });

      itWithContext(
        'Should remove test from lagging array',
        () => {
          {
            const [lagging] = useLagging();
            expect(lagging).toContain(testObjects[0]);
          }
          const added = new VestTest(testObjects[0].fieldName, jest.fn(), {
            groupName: testObjects[0].groupName,
            message: 'failure message',
          });
          setPending(added);
          {
            const [lagging] = useLagging();
            const [pending] = usePending();
            expect(pending).toContain(added);
            expect(lagging).not.toContain(testObjects[0]);
          }
          expect(expandStateRef(stateRef)).toMatchSnapshot();
        },
        getStateRef
      );

      itWithContext(
        'Should add test to pending array',
        () => {
          {
            const [pending] = usePending();
            expect(pending).not.toContain(testObjects[0]);
          }
          setPending(testObjects[0]);
          {
            const [pending] = usePending();
            expect(pending).toContain(testObjects[0]);
          }
        },
        getStateRef
      );

      itWithContext(
        'Should set test as canceled',
        () => {
          expect(testObjects[0].canceled).toBe(false);
          setPending(
            new VestTest(testObjects[0].fieldName, jest.fn(), {
              groupName: testObjects[0].groupName,
              message: 'failure message',
            })
          );
          expect(testObjects[0].canceled).toBe(true);
        },
        getStateRef
      );
    });
  });
});
