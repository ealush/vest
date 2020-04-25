import _ from 'lodash';
import resetState from '../../../../../testUtils/resetState';
import { getState } from '../../../state';
import getSuiteState from '../../../state/getSuiteState';
import patch from '../../../state/patch';
import { SYMBOL_CANCELED } from '../../../state/symbols';
import VestTest from '../VestTest';
import { removePending, setPending } from '.';

const suiteId = 'suite_1';

describe('module: pending', () => {
  let state, testObject;
  beforeEach(() => resetState(suiteId));
  describe('export: removePending', () => {
    describe('When testObject it not pending or lagging', () => {
      beforeEach(() => {
        state = _.cloneDeep(getSuiteState(suiteId));
        testObject = new VestTest(
          suiteId,
          'field_1',
          'failure_message',
          jest.fn()
        );
      });
      it('Should keep state unchanged', () => {
        removePending(testObject);
        expect(getSuiteState(suiteId)).toEqual(state);
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
          new VestTest(suiteId, `test_${i}`, 'Some statement string', jest.fn())
      );
    });

    it('Should set supplied test object as pending', () => {
      expect(getSuiteState(suiteId).pending).not.toContain(testObjects[0]);
      setPending(suiteId, testObjects[0]);
      expect(getSuiteState(suiteId).pending).toContain(testObjects[0]);
    });

    describe('When field is in lagging array', () => {
      beforeEach(() => {
        patch(suiteId, state => ({
          ...state,
          lagging: state.lagging.concat(
            testObjects[2],
            testObjects[0],
            testObjects[1]
          ),
        }));
      });

      it('Should remove test from lagging array', () => {
        expect(getSuiteState(suiteId).lagging).toContain(testObjects[0]);
        setPending(suiteId, testObjects[0]);
        expect(getSuiteState(suiteId).lagging).not.toContain(testObjects[0]);
        expect(getSuiteState(suiteId)).toMatchSnapshot();
      });

      it('Should add test to pending array', () => {
        expect(getSuiteState(suiteId).pending).not.toContain(testObjects[0]);
        setPending(suiteId, testObjects[0]);
        expect(getSuiteState(suiteId).pending).toContain(testObjects[0]);
      });

      it('Should set test as canceled', () => {
        expect(getState(SYMBOL_CANCELED)).not.toMatchObject({
          [testObjects[0].id]: true,
        });
        setPending(suiteId, testObjects[0]);
        expect(getState(SYMBOL_CANCELED)).toMatchObject({
          [testObjects[0].id]: true,
        });
      });
    });
  });
});
