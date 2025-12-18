import { describe, it, expect } from 'vitest';
import * as vest from '../vest';
import { enforce } from 'n4s';

describe('SuiteResult Cache Expiration', () => {
  it('Should clear the suite result cache between runs when fields are skipped', () => {
    // This test reproduces the issue where failing to expire the suite result cache
    // causes stale or incomplete results to be returned in subsequent runs,
    // especially when some fields are skipped or not run.

    // Scenario taken from integration.stateful-tests.test.ts "more complex" suite.
    // 1. We have skipped fields (confirm) based on other field's state (password).
    // 2. We run the suite focusing on specific fields.
    // 3. We expect the suite result to accurately reflect the merged state of the current and previous runs.

    const suite = vest.create(
      (data: Record<string, string> = {}, only: string) => {
        vest.only(only);

        vest.test('username', 'username is required', () => {
          enforce(data.username).isNotEmpty();
        });

        vest.test('password', 'password is required', () => {
          enforce(data.password).isNotEmpty();
        });

        vest.skipWhen(
          draft => draft.hasErrors('password'),
          () => {
            vest.test('confirm', 'passwords do not match', () => {
              enforce(data.confirm).equals(data.password);
            });
          },
        );
      },
    );

    const data: Record<string, string> = {};

    // Run 1: user_1 provided. username passes. password fails (required). confirm skipped (because password has errors).
    data.username = 'user_1';
    suite.run(data, 'username');

    // Run 2: password field run. Fails. confirm still skipped.
    suite.run(data, 'password');
    const res = suite.get();

    expect(res.tests.password.errorCount).toBe(1);

    // When the suite result cache is not expired after the run, `suite.get()`
    // returns a stale result object that may not include fields that were
    // processed or skipped in the most recent run (like 'confirm' in this case).
    // Failing to expire the cache prevents re-calculation of the summary
    // based on the updated state.

    expect(res.tests).toHaveProperty('confirm');
    expect(res.tests.confirm.testCount).toBe(0); // It was skipped
  });

  it('Should ensure result consistency when reading result immediately after run', () => {
    // This test ensures that `suite.get()` always returns a fresh result object
    // reflecting the latest run, rather than a cached result from a previous state.

    const suite = vest.create(() => {
      vest.test('field1', () => false);
    });

    suite.run();

    const res1 = suite.get();
    expect(res1.hasErrors('field1')).toBe(true);

    // Subsequent calls return the same memoized object
    const res2 = suite.get();
    expect(res1).toBe(res2);

    // Run again - state changes
    suite.run();
    const res3 = suite.get();

    // If cache wasn't expired, res3 would be the same stale object as res1/res2.
    // Since we expire cache on run finish, res3 should be a new object.
    expect(res3).not.toBe(res1);
  });
});
