import faker from 'faker';
import vest from '../..';

import context from '../../core/context';

import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import { ERROR_OUTSIDE_OF_TEST } from './constants';

const { create, test, warn } = vest;

describe('warn hook', () => {
  describe('When currentTest exists', () => {
    it('Should set isWarning to true', () => {
      let beforeWarn, afterWarn;
      create(faker.random.word(), () => {
        test(faker.lorem.word(), faker.lorem.sentence(), () => {
          beforeWarn = context.use().currentTest.isWarning;
          warn();
          afterWarn = context.use().currentTest.isWarning;
        });
      })();

      expect(beforeWarn).toBe(false);
      expect(afterWarn).toBe(true);
    });
  });

  describe('Error handling', () => {
    let warn, create;

    beforeEach(() => {
      ({ create, warn } = require('../..'));
    });

    it('Should throw error when currentTest is not present', () => {
      const done = jest.fn();
      create(faker.random.word(), () => {
        expect(warn).toThrow(ERROR_OUTSIDE_OF_TEST);
        done();
      })();
      expect(done).toHaveBeenCalled();
    });

    it('Should throw error when no suite present', () => {
      expect(warn).toThrow(ERROR_HOOK_CALLED_OUTSIDE);
    });
  });
});
