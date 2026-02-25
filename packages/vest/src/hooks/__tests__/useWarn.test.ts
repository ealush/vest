import { faker } from '@faker-js/faker';
import { describe, it, expect, vi } from 'vitest';

import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../../errors/ErrorStrings';
import * as vest from '../../vest';

const { create, test, useWarn } = vest;

describe('useWarn hook', () => {
  it('should set severity to warning', () => {
    let t: ReturnType<typeof test> | undefined;
    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const setWarn = useWarn();
        setWarn();
      });
    }).run();

    expect(VestTest.warns(VestTest.cast(t).unwrap()).unwrap()).toBe(true);
  });

  it('should throw when called outside a test body', () => {
    const done = vi.fn();

    create(() => {
      // `create` provides suite context but no active test body; therefore
      // useWarn -> useCurrentTest has no current test and must throw
      // ErrorStrings.USE_WARN_MUST_BE_CALLED_FROM_TEST.
      expect(useWarn).toThrow(ErrorStrings.USE_WARN_MUST_BE_CALLED_FROM_TEST);
      done();
    }).run();

    expect(done).toHaveBeenCalled();
  });

  it('should throw when called without an active suite', () => {
    expect(useWarn).toThrow(ErrorStrings.HOOK_CALLED_OUTSIDE);
  });

  it('should surface the correct error when called after await in async test body', async () => {
    const fieldName = faker.lorem.word();

    const suite = create(() => {
      test(fieldName, async () => {
        await Promise.resolve();
        useWarn();
      });
    });

    await suite.run();

    expect(suite.get().getErrors(fieldName)).toEqual([
      ErrorStrings.HOOK_CALLED_OUTSIDE,
    ]);
  });

  it('should no-op when setter is called after test resolution', () => {
    let t: ReturnType<typeof test> | undefined;
    let setWarn: ReturnType<typeof useWarn> | undefined;

    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        setWarn = useWarn();
        vest.enforce(false).equals(true);
      });
    }).run();

    const currentTest = VestTest.cast(t).unwrap();

    expect(VestTest.isFailing(currentTest).unwrap()).toBe(true);
    expect(VestTest.warns(currentTest).unwrap()).toBe(false);
    expect(() => setWarn?.()).not.toThrow();
    expect(VestTest.isFailing(currentTest).unwrap()).toBe(true);
    expect(VestTest.warns(currentTest).unwrap()).toBe(false);
  });
});
