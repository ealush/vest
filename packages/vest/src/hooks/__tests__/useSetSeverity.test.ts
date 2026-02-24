import { faker } from '@faker-js/faker';
import { describe, it, expect, vi } from 'vitest';

import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../../errors/ErrorStrings';
import * as vest from '../../vest';

const { create, test, useSetSeverity, TestSeverity } = vest;

describe('useSetSeverity hook', () => {
  it('should set severity to warning', () => {
    let t: ReturnType<typeof test> | undefined;
    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const setSeverity = useSetSeverity();
        setSeverity(TestSeverity.Warning);
      });
    }).run();

    expect(VestTest.warns(VestTest.cast(t).unwrap()).unwrap()).toBe(true);
  });

  it('should set severity to error', () => {
    let t: ReturnType<typeof test> | undefined;
    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const setSeverity = useSetSeverity();
        setSeverity(TestSeverity.Warning);
        setSeverity(TestSeverity.Error);
      });
    }).run();

    expect(VestTest.warns(VestTest.cast(t).unwrap()).unwrap()).toBe(false);
  });

  it('should throw when called outside a test body', () => {
    const done = vi.fn();

    create(() => {
      // `create` provides a suite-level execution context, but not an active test body.
      // So `useSetSeverity` calls `useCurrentTest` without a current test and should
      // trigger ErrorStrings.SET_SEVERITY_MUST_BE_CALLED_FROM_TEST.
      expect(useSetSeverity).toThrow(
        ErrorStrings.SET_SEVERITY_MUST_BE_CALLED_FROM_TEST,
      );
      done();
    }).run();

    expect(done).toHaveBeenCalled();
  });

  it('should throw when called without an active suite', () => {
    expect(useSetSeverity).toThrow(ErrorStrings.HOOK_CALLED_OUTSIDE);
  });

  it('should no-op when setter is called after test resolution', () => {
    let t: ReturnType<typeof test> | undefined;
    let setSeverity: ReturnType<typeof useSetSeverity> | undefined;

    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        setSeverity = useSetSeverity();
        vest.enforce(false).equals(true);
      });
    }).run();

    const currentTest = VestTest.cast(t).unwrap();

    expect(VestTest.isFailing(currentTest).unwrap()).toBe(true);
    expect(VestTest.warns(currentTest).unwrap()).toBe(false);
    expect(() => setSeverity?.(TestSeverity.Warning)).not.toThrow();
    expect(VestTest.isFailing(currentTest).unwrap()).toBe(true);
    expect(VestTest.warns(currentTest).unwrap()).toBe(false);
  });
});
