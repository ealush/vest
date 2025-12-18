import { describe, it, expect } from 'vitest';
import * as vest from '../vest';

describe('Suite Result during run', () => {
  it('Should reflect the current state of the run', () => {
    // This test verifies that the suite result is updated in real-time as the suite runs.
    // It checks that:
    // 1. At the beginning of the run, the result is clean (no errors).
    // 2. After a failing test runs, the result immediately reflects the error.
    // 3. After a passing test runs, the result is updated accordingly, preserving previous errors.

    const suite = vest.create(() => {
      // 1. Start of run - should be empty/valid
      const res1 = suite.get();
      expect(res1.hasErrors()).toBe(false);
      expect(res1.tests.field1).toBeUndefined();

      vest.test('field1', () => false);

      // 2. After field1 fails
      const res2 = suite.get();
      expect(res2.hasErrors('field1')).toBe(true);
      expect(res2.errorCount).toBe(1);

      vest.test('field2', () => true);

      // 3. After field2 passes
      const res3 = suite.get();
      expect(res3.hasErrors('field1')).toBe(true);
      expect(res3.hasErrors('field2')).toBe(false);
    });

    suite.run();
  });

  it('Should start with a clean state on subsequent runs', () => {
    // This test ensures that a new run of the suite starts with a fresh state,
    // completely independent of any previous runs.
    // Scenario:
    // 1. Define a suite that asserts it is clean at the very beginning of its execution.
    // 2. Run the suite once, causing it to have errors.
    // 3. Run the suite again.
    // Expected behavior: The assertion inside the suite (that it is clean at start) should pass
    // in both the first and second runs. If state leaked, the second run would see errors from the first run.

    const suite = vest.create(() => {
      // Start of run
      const res = suite.get();

      // Should always be clean at start.
      // If state leaks from the previous run, this expectation will fail on the second run.
      expect(res.hasErrors()).toBe(false);
      expect(res.testCount).toBe(0);

      vest.test('field1', () => false);
    });

    // First run - populates state with errors
    suite.run();
    const res1 = suite.get();
    expect(res1.hasErrors()).toBe(true);

    // Second run - should start clean again
    suite.run();
  });

  it('Should not reflect previous run state during execution', () => {
    // This test specifically targets the "state refill" (or lack thereof) behavior during execution.
    // It guards against a regression where `suite.get()` during a run might return results from a
    // PREVIOUS run if the current run hasn't reached that field yet.
    //
    // Scenario:
    // 1. Suite has two fields: field_A (always fails) and field_B (fails).
    // 2. First run: Both fields fail. Suite state has errors for both.
    // 3. Second run starts.
    // 4. field_A runs and fails.
    // 5. We call `suite.get()` BEFORE field_B runs.
    //
    // Expected behavior:
    // - The result should contain the failure for field_A (current run).
    // - The result should NOT contain any information about field_B, because it hasn't run yet
    //   in the current execution context. It should not "remember" that field_B failed in the previous run.

    const suite = vest.create(() => {
      vest.test('field_A', () => false); // Always fails

      const res = suite.get();
      // At this point field_A has run and failed.
      expect(res.hasErrors('field_A')).toBe(true);

      // field_B hasn't run yet in THIS run.
      // If we are in the second run, checking field_B should be clean
      // and NOT reflect the previous run's result where field_B failed.
      expect(res.hasErrors('field_B')).toBe(false);
      expect(res.tests.field_B).toBeUndefined();

      vest.test('field_B', () => false);
    });

    suite.run(); // Run 1: field_A fails, field_B fails.
    expect(suite.get().hasErrors('field_B')).toBe(true);

    suite.run(); // Run 2: Check inside that field_B is clean before it runs.
  });
});
