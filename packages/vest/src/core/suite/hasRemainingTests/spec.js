import faker from 'faker';
import _ from 'lodash';
import resetState from '../../../../testUtils/resetState';
import * as suiteState from '../suiteState';
import hasRemainingTests from '.';

const suiteId = 'suite_1';
let state;

const addPendingOrLagging = (key, fieldName) => {
  state = suiteState.patch(suiteId, state => ({
    ...state,
    [key]: Array.from({ length: _.random(1, 3) }, () => ({
      fieldName: fieldName || faker.random.word(),
    })),
  }));
};

describe('hasRemainingTests', () => {
  beforeEach(() => {
    state = resetState(suiteId);
  });

  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it('should return false', () => {
        expect(hasRemainingTests(state)).toBe(false);
      });
    });

    describe('When there are remaining tests', () => {
      test('pending tests return true', () => {
        addPendingOrLagging('pending');
        expect(hasRemainingTests(state)).toBe(true);
      });

      test('lagging tests return true', () => {
        addPendingOrLagging('lagging');
        expect(hasRemainingTests(state)).toBe(true);
      });

      test('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging');
        addPendingOrLagging('pending');
        expect(hasRemainingTests(state)).toBe(true);
      });
    });
  });

  describe('When field specified', () => {
    let fieldName;

    beforeEach(() => {
      fieldName = faker.lorem.word();
    });
    describe('When no remaining tests', () => {
      it('Should return false', () => {
        expect(hasRemainingTests(state, fieldName)).toBe(false);
      });
    });

    describe('When remaining tests', () => {
      test('pending tests return true', () => {
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests(state)).toBe(true);
      });

      test('lagging tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        expect(hasRemainingTests(state)).toBe(true);
      });

      test('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests(state)).toBe(true);
      });
    });
  });
});
