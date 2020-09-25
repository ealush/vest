import _ from 'lodash';
import resetState from '../../../../../testUtils/resetState';
import state from '../../../state';
import { KEY_CANCELED } from '../../../state/constants';
import * as suiteState from '../../../suite/suiteState';
import VestTest from '../VestTest';
import { removePending, setPending } from '.';

const suiteId = 'suite_1';
const groupName = 'group_name';

describe('module: pending', () => {
  let currentState, testObject;
  beforeEach(() => resetState(suiteId));
  describe('export: removePending', () => {
    describe('When testObject it not pending or lagging', () => {
      beforeEach(() => {
        currentState = _.cloneDeep(suiteState.getState(suiteId));
        testObject = new VestTest({
          fieldName: 'field_1',
          statement: 'failure_message',
          suiteId,
          testFn: jest.fn(),
        });
      });
      it('Should keep state unchanged', () => {
        removePending(testObject);
        expect(suiteState.getState(suiteId)).toEqual(currentState);
      });
    });

    describe('When testObject is either pending or lagging', () => {
      describe('When in pending', () => {
        beforeEach(() => {
          suiteState.patch(suiteId, state => ({
            ...state,
            pending: state.pending.concat(testObject),
          }));
        });

        it('Should remove test from pending', () => {
          expect(suiteState.getState(suiteId).pending).toContain(testObject);
          removePending(testObject);
          expect(suiteState.getState(suiteId).pending).not.toContain(
            testObject
          );
          expect(suiteState.getState(suiteId)).toMatchSnapshot();
        });
      });
      describe('When in lagging', () => {
        beforeEach(() => {
          suiteState.patch(suiteId, state => ({
            ...state,
            lagging: state.lagging.concat(testObject),
          }));
        });

        it('Should remove test from lagging', () => {
          expect(suiteState.getState(suiteId).lagging).toContain(testObject);
          removePending(testObject);
          expect(suiteState.getState(suiteId).lagging).not.toContain(
            testObject
          );
          expect(suiteState.getState(suiteId)).toMatchSnapshot();
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
            suiteId,
            testFn: jest.fn(),
          })
      );
      testObjects[0].groupName = groupName;
    });

    it('Should set supplied test object as pending', () => {
      expect(suiteState.getState(suiteId).pending).not.toContain(
        testObjects[0]
      );
      setPending(testObjects[0]);
      expect(suiteState.getState(suiteId).pending).toContain(testObjects[0]);
    });

    describe('When a field of the same profile is in lagging array', () => {
      beforeEach(() => {
        suiteState.patch(suiteId, state => ({
          ...state,
          lagging: state.lagging.concat(
            testObjects[2], // same fieldName, group = undefined
            testObjects[0], // same fieldName, group = group_name
            testObjects[1] // same fieldName, group = undefined
          ),
        }));
      });

      it('Should remove test from lagging array', () => {
        expect(suiteState.getState(suiteId).lagging).toContain(testObjects[0]);
        setPending(testObjects[0]);
        expect(suiteState.getState(suiteId).lagging).not.toContain(
          testObjects[0]
        );
        expect(suiteState.getState(suiteId)).toMatchSnapshot();
      });

      it('Should add test to pending array', () => {
        expect(suiteState.getState(suiteId).pending).not.toContain(
          testObjects[0]
        );
        setPending(testObjects[0]);
        expect(suiteState.getState(suiteId).pending).toContain(testObjects[0]);
      });

      it('Should set test as canceled', () => {
        expect(state.get()[KEY_CANCELED]).not.toMatchObject({
          [testObjects[0].id]: true,
        });
        setPending(testObjects[0]);
        expect(state.get()[KEY_CANCELED]).toMatchObject({
          [testObjects[0].id]: true,
        });
      });
    });
  });
});
