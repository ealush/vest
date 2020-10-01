import faker from 'faker';
import _ from 'lodash';
import createState from '../../state';
import hasRemainingTests from '.';

let stateRef;

const addPendingOrLagging = (key, fieldName) => {
  stateRef.patch(state => ({
    ...state,
    [key]: Array.from({ length: _.random(1, 3) }, () => ({
      fieldName: fieldName || faker.random.word(),
    })),
  }));
};

describe('hasRemainingTests', () => {
  beforeEach(() => {
    stateRef = createState('suite_name');
  });

  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it('should return false', () => {
        expect(hasRemainingTests(stateRef.current())).toBe(false);
      });
    });

    describe('When there are remaining tests', () => {
      test('pending tests return true', () => {
        addPendingOrLagging('pending');
        expect(hasRemainingTests(stateRef.current())).toBe(true);
      });

      test('lagging tests return true', () => {
        addPendingOrLagging('lagging');
        expect(hasRemainingTests(stateRef.current())).toBe(true);
      });

      test('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging');
        addPendingOrLagging('pending');
        expect(hasRemainingTests(stateRef.current())).toBe(true);
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
        expect(hasRemainingTests(stateRef.current(), fieldName)).toBe(false);
      });
    });

    describe('When remaining tests', () => {
      test('pending tests return true', () => {
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests(stateRef.current())).toBe(true);
      });

      test('lagging tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        expect(hasRemainingTests(stateRef.current())).toBe(true);
      });

      test('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests(stateRef.current())).toBe(true);
      });
    });
  });
});
