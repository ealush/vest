import faker from 'faker';
import _ from 'lodash';

import itWithContext from '../../../../testUtils/itWithContext';
import runCreateRef from '../../../../testUtils/runCreateRef';

import VestTest from 'VestTest';
import context from 'ctx';
import hasRemainingTests from 'hasRemainingTests';
import { usePending, useLagging } from 'stateHooks';

let stateRef;
const getCtx = () => ({ stateRef });

const addPendingOrLagging = (
  key: 'pending' | 'lagging',
  fieldName?: string
) => {
  context.run({ stateRef }, () => {
    const [, setPending] = usePending();
    const [, setLagging] = useLagging();

    const setter = key === 'pending' ? setPending : setLagging;

    setter(() => {
      return Array.from(
        { length: _.random(1, 3) },
        () => new VestTest(fieldName ?? faker.random.word(), jest.fn())
      );
    });
  });
};

describe('hasRemainingTests', () => {
  beforeEach(() => {
    stateRef = runCreateRef();
  });

  describe('When no field specified', () => {
    describe('When no remaining tests', () => {
      itWithContext(
        'should return false',
        () => {
          expect(hasRemainingTests()).toBe(false);
        },
        getCtx
      );
    });

    describe('When there are remaining tests', () => {
      itWithContext(
        'pending tests return true',
        () => {
          addPendingOrLagging('pending');

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging tests return true',
        () => {
          addPendingOrLagging('lagging');

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging and pending tests return true',
        () => {
          addPendingOrLagging('lagging');
          addPendingOrLagging('pending');

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );
    });
  });

  describe('When field specified', () => {
    let fieldName;

    beforeEach(() => {
      fieldName = faker.lorem.word();
    });
    describe('When no remaining tests', () => {
      itWithContext(
        'Should return false',
        () => {
          expect(hasRemainingTests(fieldName)).toBe(false);
        },
        getCtx
      );
    });

    describe('When remaining tests', () => {
      itWithContext(
        'pending tests return true',
        () => {
          addPendingOrLagging('pending', fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging tests return true',
        () => {
          addPendingOrLagging('lagging', fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging and pending tests return true',
        () => {
          addPendingOrLagging('lagging', fieldName);
          addPendingOrLagging('pending', fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );
    });
  });
});
