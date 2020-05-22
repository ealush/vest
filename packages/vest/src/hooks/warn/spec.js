import faker from 'faker';
import mock from '../../../testUtils/mock';
import runSpec from '../../../testUtils/runSpec';
import singleton from '../../lib/singleton';

import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import { ERROR_OUTSIDE_OF_TEST } from './constants';

runSpec(vest => {
  const { validate, test, warn } = vest;

  describe('warn hook', () => {
    describe('When currentTest exists', () => {
      it('Should set isWarning to true', () => {
        let beforeWarn, afterWarn;
        validate(faker.random.word(), () => {
          test(faker.lorem.word(), faker.lorem.sentence(), () => {
            beforeWarn = singleton.useContext().currentTest.isWarning;
            warn();
            afterWarn = singleton.useContext().currentTest.isWarning;
          });
        });

        expect(beforeWarn).toBe(false);
        expect(afterWarn).toBe(true);
      });
    });

    describe('Error handling', () => {
      let mockThrowError, warn;

      beforeEach(() => {
        mockThrowError = mock('throwError');
        warn = require('.');
      });

      it('Should throw error when currentTest is not present', () => {
        validate(faker.random.word(), () => {
          warn();
        });

        expect(mockThrowError).toHaveBeenCalledWith(ERROR_OUTSIDE_OF_TEST);
      });

      it('Should throw error when no suite present', () => {
        warn();

        expect(mockThrowError.mock.calls[0][0]).toContain(
          ERROR_HOOK_CALLED_OUTSIDE
        );
      });
    });
  });
});
