import faker from 'faker';

import context from 'ctx';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';
import * as vest from 'vest';

const { create, test, warn } = vest;

describe('warn hook', () => {
  describe('When currentTest exists', () => {
    it('Should set warns to true', () => {
      let beforeWarn, afterWarn;
      create(() => {
        test(faker.lorem.word(), faker.lorem.sentence(), () => {
          beforeWarn = context.useX().currentTest!.warns; // eslint-disable-line @typescript-eslint/no-non-null-assertion
          warn();
          afterWarn = context.useX().currentTest!.warns; // eslint-disable-line @typescript-eslint/no-non-null-assertion
        });
      })();

      expect(beforeWarn).toBe(false);
      expect(afterWarn).toBe(true);
    });
  });

  describe('Error handling', () => {
    let warn, create;

    beforeEach(() => {
      ({ create, warn } = require('vest'));
    });

    it('Should throw error when currentTest is not present', () => {
      const done = jest.fn();
      create(() => {
        expect(warn).toThrow(
          "warn hook called outside of a test callback. It won't have an effect."
        );
        done();
      })();
      expect(done).toHaveBeenCalled();
    });

    it('Should throw error when no suite present', () => {
      expect(warn).toThrow(ERROR_HOOK_CALLED_OUTSIDE);
    });
  });
});
