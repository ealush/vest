import { describe, it, expect } from 'vitest';
import * as vest from '../vest';

describe('Nested Tests Fail Fast', () => {
  it('Should apply fail-fast behavior even when tests are nested', () => {
    // This test reproduces the edge case where `registerTestsTraverseUp` is missing
    // in `TEST_COMPLETED` handler in VestBus.
    //
    // The `registerTestsTraverseUp` function ensures that when a test completes,
    // its status is propagated upwards so that the top-level test registry knows about it.
    // This is crucial for runtime checks like fail-fast (Eager mode) which operate
    // primarily on the top-level registry to decide whether to run subsequent tests.
    //
    // If we remove `registerTestsTraverseUp`, nested tests might complete, but the
    // top-level registry might not be aware of their completion or failure status
    // in time (or at all in the structure that checks for fail-fast), causing subsequent tests
    // to run when they should have been skipped.

    // Scenario:
    // 1. Eager mode (default).
    // 2. Tests are nested in a group.
    // 3. Tests fail.
    // 4. Subsequent tests for the same field should be skipped immediately.

    const suite = vest.create(() => {
      vest.group('group_1', () => {
        // Field 1
        vest.test('field_1', 'first-of-field_1', () => false); // Fails
        vest.test('field_1', 'second-of-field_1', () => false); // Should be skipped

        // Field 2
        vest.test('field_2', 'first-of-field_2', () => false); // Fails
        vest.test('field_2', 'second-of-field_2', () => false); // Should be skipped
      });
    });

    suite.run();

    // Verify test count.
    // If fail-fast works: 2 tests should run (one failure per field).
    // If fail-fast breaks: 4 tests might run.
    expect(suite.get().testCount).toBe(2);
    expect(suite.get().errorCount).toBe(2);

    expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
    expect(suite.get().getErrors('field_2')).toEqual(['first-of-field_2']);
  });
});
