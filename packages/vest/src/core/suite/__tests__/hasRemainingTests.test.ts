import faker from 'faker';
import _ from 'lodash';

import itWithContext from '../../../../testUtils/itWithContext';
import runCreateRef from '../../../../testUtils/runCreateRef';
import { addTestObject } from '../../../../testUtils/testObjects';

import VestTest from 'VestTest';
import context from 'ctx';
import hasRemainingTests from 'hasRemainingTests';

let stateRef;
const getCtx = () => ({ stateRef });

const addPending = (fieldName?: string) => {
  context.run({ stateRef }, () => {
    const added = Array.from(
      { length: _.random(1, 3) },
      () => new VestTest(fieldName ?? faker.random.word(), jest.fn())
    );

    addTestObject(added);
    added.forEach(testObject => testObject.setPending());
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
          addPending();

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging tests return true',
        () => {
          addPending();

          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging and pending tests return true',
        () => {
          addPending();
          addPending();

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
          addPending(fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging tests return true',
        () => {
          addPending(fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );

      itWithContext(
        'lagging and pending tests return true',
        () => {
          addPending(fieldName);
          addPending(fieldName);
          expect(hasRemainingTests()).toBe(true);
        },
        getCtx
      );
    });
  });
});
