import _ from 'lodash';
import resetState from '../../../../../testUtils/resetState';
import * as state from '../../../state';
import { KEY_CANCELED } from '../../../state/constants';
import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
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
        currentState = _.cloneDeep(getSuiteState(suiteId));
        testObject = new VestTest({
          fieldName: 'field_1',
          statement: 'failure_message',
          suiteId,
          testFn: jest.fn(),
        });
      });
      it('Should keep state unchanged', () => {
        removePending(testObject);
        expect(getSuiteState(suiteId)).toEqual(currentState);
      });
    });

    describe('When testObject is either pending or lagging', () => {
      describe('When in pending', () => {
        beforeEach(() => {
          patch(suiteId, state => ({
            ...state,
            pending: state.pending.concat(testObject),
          }));
        });

        it('Should remove test from pending', () => {
          expect(getSuiteState(suiteId).pending).toContain(testObject);
          removePending(testObject);
          expect(getSuiteState(suiteId).pending).not.toContain(testObject);
          expect(getSuiteState(suiteId)).toMatchSnapshot();
        });
      });
      describe('When in lagging', () => {
        beforeEach(() => {
          patch(suiteId, state => ({
            ...state,
            lagging: state.lagging.concat(testObject),
          }));
        });

        it('Should remove test from lagging', () => {
          expect(getSuiteState(suiteId).lagging).toContain(testObject);
          removePending(testObject);
          expect(getSuiteState(suiteId).lagging).not.toContain(testObject);
          expect(getSuiteState(suiteId)).toMatchSnapshot();
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
      expect(getSuiteState(suiteId).pending).not.toContain(testObjects[0]);
      setPending(testObjects[0]);
      expect(getSuiteState(suiteId).pending).toContain(testObjects[0]);
    });

    describe('When a field of the same profile is in lagging array', () => {
      beforeEach(() => {
        patch(suiteId, state => ({
          ...state,
          lagging: state.lagging.concat(
            testObjects[2], // same fieldName, group = undefined
            testObjects[0], // same fieldName, group = group_name
            testObjects[1] // same fieldName, group = undefined
          ),
        }));
      });

      it('Should remove test from lagging array', () => {
        expect(getSuiteState(suiteId).lagging).toContain(testObjects[0]);
        setPending(testObjects[0]);
        expect(getSuiteState(suiteId).lagging).not.toContain(testObjects[0]);
        expect(getSuiteState(suiteId)).toMatchSnapshot();
      });

      it('Should add test to pending array', () => {
        expect(getSuiteState(suiteId).pending).not.toContain(testObjects[0]);
        setPending(testObjects[0]);
        expect(getSuiteState(suiteId).pending).toContain(testObjects[0]);
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
