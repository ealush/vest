import { faker } from '@faker-js/faker';
import { describe, it, expect, vi } from 'vitest';

import { ErrorStrings } from '../../errors/ErrorStrings';
import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import * as vest from '../../vest';

const { create, test, warn } = vest;

describe('warn hook', () => {
  describe('When currentTest exists', () => {
    it('should set warns to true for the current test', () => {
      let t;
      create(() => {
        t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
          warn();
        });
      }).run();

      expect(VestTest.warns(VestTest.cast(t))).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should throw when called outside a test body', () => {
      const done = vi.fn();
      create(() => {
        expect(warn).toThrow(ErrorStrings.WARN_MUST_BE_CALLED_FROM_TEST);
        done();
      }).run();
      expect(done).toHaveBeenCalled();
    });

    it('should throw when called without an active suite', () => {
      expect(warn).toThrow(ErrorStrings.HOOK_CALLED_OUTSIDE);
    });
  });
});
