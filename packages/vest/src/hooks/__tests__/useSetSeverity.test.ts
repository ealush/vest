import { faker } from '@faker-js/faker';
import { describe, it, expect, vi } from 'vitest';

import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../../errors/ErrorStrings';
import * as vest from '../../vest';

const { create, test, useSetSeverity, TestSeverity } = vest;

describe('useSetSeverity hook', () => {
  it('should set severity to warning', () => {
    let t;
    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const setSeverity = useSetSeverity();
        setSeverity(TestSeverity.Warning);
      });
    }).run();

    expect(VestTest.warns(VestTest.cast(t).unwrap()).unwrap()).toBe(true);
  });

  it('should set severity to error', () => {
    let t;
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
});
