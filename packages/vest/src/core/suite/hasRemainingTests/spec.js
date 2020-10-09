import faker from 'faker';
import _ from 'lodash';
import runCreateRef from '../../../../testUtils/runCreateRef';
import context from '../../context';
import usePending from '../../test/lib/pending/usePending';
import hasRemainingTests from '.';

let stateRef;

it.ctx = (str, cb) => it(str, () => context.run({ stateRef }, cb));

const addPendingOrLagging = (key, fieldName) => {
  context.run({ stateRef }, () => {
    const [, setPending] = usePending();

    setPending(state => {
      state[key] = Array.from({ length: _.random(1, 3) }, () => ({
        fieldName: fieldName || faker.random.word(),
      }));

      return state;
    });
  });
};

describe('hasRemainingTests', () => {
  beforeEach(() => {
    stateRef = runCreateRef();
  });

  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      it.ctx('should return false', () => {
        expect(hasRemainingTests()).toBe(false);
      });
    });

    describe('When there are remaining tests', () => {
      it.ctx('pending tests return true', () => {
        addPendingOrLagging('pending');

        expect(hasRemainingTests()).toBe(true);
      });

      it.ctx('lagging tests return true', () => {
        addPendingOrLagging('lagging');

        expect(hasRemainingTests()).toBe(true);
      });

      it.ctx('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging');
        addPendingOrLagging('pending');

        expect(hasRemainingTests()).toBe(true);
      });
    });
  });

  describe('When field specified', () => {
    let fieldName;

    beforeEach(() => {
      fieldName = faker.lorem.word();
    });
    describe('When no remaining tests', () => {
      it.ctx('Should return false', () => {
        expect(hasRemainingTests(fieldName)).toBe(false);
      });
    });

    describe('When remaining tests', () => {
      it.ctx('pending tests return true', () => {
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests()).toBe(true);
      });

      it.ctx('lagging tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        expect(hasRemainingTests()).toBe(true);
      });

      it.ctx('lagging and pending tests return true', () => {
        addPendingOrLagging('lagging', fieldName);
        addPendingOrLagging('pending', fieldName);
        expect(hasRemainingTests()).toBe(true);
      });
    });
  });
});
