import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';

import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../../errors/ErrorStrings';
import * as vest from '../../vest';

const { create, test, useSeverity } = vest;

describe('useSeverity hook', () => {
  it('should expose error, warn and success severity setters', () => {
    let t;

    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const severity = useSeverity();
        severity.warn();
        severity.error();
        severity.success();
      });
    }).run();

    expect(VestTest.isSuccess(VestTest.cast(t).unwrap()).unwrap()).toBe(true);
  });

  it('should allow resetting severity back to error', () => {
    let t;

    create(() => {
      t = test(faker.lorem.word(), faker.lorem.sentence(), () => {
        const { success, error } = useSeverity();
        success();
        error();
      });
    }).run();

    const castTest = VestTest.cast(t).unwrap();
    expect(VestTest.isSuccess(castTest).unwrap()).toBe(false);
    expect(VestTest.getData(castTest).severity).toBe('error');
  });

  it('should throw when called outside a test body', () => {
    create(() => {
      expect(useSeverity).toThrow(
        ErrorStrings.USE_SEVERITY_MUST_BE_CALLED_FROM_TEST,
      );
    }).run();
  });

  it('should throw when called without an active suite', () => {
    expect(useSeverity).toThrow(ErrorStrings.HOOK_CALLED_OUTSIDE);
  });
});
