import faker from 'faker';
import _ from 'lodash';

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
      it.withContext(
        'should return false',
        () => {
          expect(hasRemainingTests()).toBe(false);
        },
        getCtx
      );
    });

    describe('When there are remaining tests', () => {
      it.withContext(
        'pending tests return true',
        () => {
          addPendingOrLagging('pending');

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      it.withContext(
        'lagging tests return true',
        () => {
          addPendingOrLagging('lagging');

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      it.withContext(
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
      it.withContext(
        'Should return false',
        () => {
          expect(hasRemainingTests(fieldName)).toBe(false);
        },
        getCtx
      );
    });

    describe('When remaining tests', () => {
      it.withContext(
        'pending tests return true',
        () => {
          addPendingOrLagging('pending', fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      it.withContext(
        'lagging tests return true',
        () => {
          addPendingOrLagging('lagging', fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      it.withContext(
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
