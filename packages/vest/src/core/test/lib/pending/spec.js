import _ from 'lodash';
import context from '../../../context';
import createState from '../../../state';
import VestTest from '../VestTest';
import { removePending, setPending } from '.';

const groupName = 'group_name';

describe('module: pending', () => {
  let currentState, testObject, stateRef;

  const runRemovePending = testObject => {
    context.run({ stateRef }, () => removePending(testObject));
  };

  beforeEach(() => {
    stateRef = createState('suite_name');
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
        beforeEach(() => {
          stateRef.patch(state => ({
            ...state,
            pending: state.pending.concat(testObject),
          }));
        });

        it('Should remove test from pending', () => {
          expect(stateRef.current().pending).toContain(testObject);
          runRemovePending(testObject);
          expect(stateRef.current().pending).not.toContain(testObject);
          expect(stateRef.current()).toMatchSnapshot();
        });
      });
      describe('When in lagging', () => {
        beforeEach(() => {
          stateRef.patch(state => ({
            ...state,
            lagging: state.lagging.concat(testObject),
          }));
        });

        it('Should remove test from lagging', () => {
          expect(stateRef.current().lagging).toContain(testObject);
          runRemovePending(testObject);
          expect(stateRef.current().lagging).not.toContain(testObject);
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

    it('Should set supplied test object as pending', () => {
      expect(stateRef.current().pending).not.toContain(testObjects[0]);
      context.run({ stateRef }, () => {
        setPending(testObjects[0]);
      });
      expect(stateRef.current().pending).toContain(testObjects[0]);
    });

    describe('When a field of the same profile is in lagging array', () => {
      beforeEach(() => {
        stateRef.patch(state => ({
          ...state,
          lagging: state.lagging.concat(
            testObjects[2], // same fieldName, group = undefined
            testObjects[0], // same fieldName, group = group_name
            testObjects[1] // same fieldName, group = undefined
          ),
        }));
      });

      it('Should remove test from lagging array', () => {
        expect(stateRef.current().lagging).toContain(testObjects[0]);
        context.run({ stateRef }, () => {
          setPending(testObjects[0]);
        });
        expect(stateRef.current().lagging).not.toContain(testObjects[0]);
        expect(stateRef.current()).toMatchSnapshot();
      });

      it('Should add test to pending array', () => {
        expect(stateRef.current().pending).not.toContain(testObjects[0]);
        context.run({ stateRef }, () => {
          setPending(testObjects[0]);
        });
        expect(stateRef.current().pending).toContain(testObjects[0]);
      });

      it('Should set test as canceled', () => {
        expect(stateRef.getCanceled()).not.toMatchObject({
          [testObjects[0].id]: true,
        });
        context.run({ stateRef }, () => {
          setPending(testObjects[0]);
        });
        expect(stateRef.getCanceled()).toMatchObject({
          [testObjects[0].id]: true,
        });
      });
    });
  });
});
