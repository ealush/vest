import { describe, it, expect } from 'vitest';
import { create, test as vestTest, group } from 'vest';
import { memo } from 'vest/memo';
import { SuiteSerializer } from 'vest/SuiteSerializer';

describe('Isolate Watcher Issue Tests', () => {
  describe('TEST_COMPLETED cache expiration', () => {
    it('should return updated results when async test completes', async () => {
      const suite = create(() => {
        vestTest('async_field', async () => {
          await new Promise(resolve => setTimeout(resolve, 50));
          throw new Error('fail');
        });
      });

      const initialResult = suite.run();

      // During pending, should show pending
      expect(initialResult.hasErrors('async_field')).toBe(false);
      expect(initialResult.tests.async_field?.pendingCount).toBe(1);

      // Wait for async test to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // After completion, suite.get() should return updated results
      const finalResult = suite.get();
      expect(finalResult.hasErrors('async_field')).toBe(true);
      expect(finalResult.tests.async_field?.pendingCount).toBe(0);
    });

    it('should update results progressively during multiple async test completions', async () => {
      const suite = create(() => {
        vestTest('fast_field', async () => {
          await new Promise(resolve => setTimeout(resolve, 20));
          throw new Error('fail fast');
        });

        vestTest('slow_field', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          throw new Error('fail slow');
        });
      });

      suite.run();

      // Wait for fast test only
      await new Promise(resolve => setTimeout(resolve, 60));

      const midResult = suite.get();
      expect(midResult.hasErrors('fast_field')).toBe(true);
      // slow_field should still be pending
      expect(midResult.tests.slow_field?.pendingCount).toBe(1);

      // Wait for slow test
      await new Promise(resolve => setTimeout(resolve, 80));

      const finalResult = suite.get();
      expect(finalResult.hasErrors('slow_field')).toBe(true);
      expect(finalResult.tests.slow_field?.pendingCount).toBe(0);
    });
  });

  describe('Ghost nodes on cache hits', () => {
    it('should not have discarded nodes in watcher after memo cache hit', () => {
      let memoCallCount = 0;

      const suite = create((data: { value: string }) => {
        memo(() => {
          memoCallCount++;
          vestTest('memoized_field', () => {
            if (data.value !== 'valid') {
              throw new Error('invalid');
            }
          });
        }, [data.value]);
      });

      // First run - should execute memo block
      suite.run({ value: 'test1' });
      expect(memoCallCount).toBe(1);

      // Second run with same value - should use cache
      suite.run({ value: 'test1' });
      expect(memoCallCount).toBe(1); // Should not increment

      // There should be exactly 1 test in the watcher (no ghost nodes)
      const tests = suite.get();
      expect(tests.testCount).toBe(1);
    });

    it('should have correct count when memo value changes', () => {
      const suite = create((data: { value: string }) => {
        memo(() => {
          vestTest('memoized_field', () => {
            if (data.value !== 'valid') {
              throw new Error('invalid');
            }
          });
        }, [data.value]);
      });

      suite.run({ value: 'test1' });
      suite.run({ value: 'test2' }); // Different value - new test created

      // Should still have exactly 1 test (previous test replaced)
      const tests = suite.get();
      expect(tests.testCount).toBe(1);
    });
  });

  describe('useLoadSuite efficiency', () => {
    it('should only register test isolates when loading suite', () => {
      const suite = create(() => {
        group('my_group', () => {
          vestTest('field1', () => {
            throw new Error('fail');
          });
          vestTest('field2', () => {
            throw new Error('fail');
          });
        });
        vestTest('field3', () => {
          throw new Error('fail');
        });
      });

      suite.run();
      const serialized = SuiteSerializer.serialize(suite);

      // Create a new suite and resume
      const suite2 = create(() => {
        // Empty callback - will be overridden by resume
      });
      SuiteSerializer.resume(suite2, serialized);

      // The resumed suite should have the same test results
      const result = suite2.get();
      expect(result.testCount).toBe(3);
      expect(result.hasErrors('field1')).toBe(true);
      expect(result.hasErrors('field2')).toBe(true);
      expect(result.hasErrors('field3')).toBe(true);
    });
  });

  describe('removeChild should remove children from watcher', () => {
    it('should remove test from tracked tests when removed via suite.remove', () => {
      const suite = create((fields: string[]) => {
        fields.forEach(field => {
          vestTest(field, () => {
            throw new Error('fail');
          });
        });
      });

      suite.run(['field1', 'field2', 'field3']);

      // Initially should have 3 tests
      let result = suite.get();
      expect(result.testCount).toBe(3);
      expect(result.hasErrors('field2')).toBe(true);

      // Remove field2 using vest API
      suite.remove('field2');

      // Should now have 2 tests
      result = suite.get();
      expect(result.testCount).toBe(2);
      expect(result.tests.field2).toBeUndefined();
    });
  });

  describe('Edge case: nested group removal cleans up all descendants', () => {
    it('should remove all tests inside a group when running with fewer fields', () => {
      const suite = create((includeGroup: boolean) => {
        vestTest('always_present', () => {
          throw new Error('fail');
        });

        if (includeGroup) {
          group('conditional_group', () => {
            vestTest('nested_test_1', () => {
              throw new Error('fail');
            });
            vestTest('nested_test_2', () => {
              throw new Error('fail');
            });
          });
        }
      });

      // First run with group
      suite.run(true);
      let result = suite.get();
      expect(result.testCount).toBe(3);
      expect(result.hasErrors('nested_test_1')).toBe(true);
      expect(result.hasErrors('nested_test_2')).toBe(true);

      // Second run without group - tests inside should be removed
      suite.run(false);
      result = suite.get();
      expect(result.testCount).toBe(1);
      expect(result.tests.nested_test_1).toBeUndefined();
      expect(result.tests.nested_test_2).toBeUndefined();
    });
  });

  describe('Edge case: IsolateSerializer adds tests to watcher during resume', () => {
    it('should track deserialized tests in the watcher for immediate queries', () => {
      const suite1 = create(() => {
        vestTest('field_a', () => {
          throw new Error('error a');
        });
        vestTest('field_b', () => {
          // pass
        });
      });

      suite1.run();
      const serialized = SuiteSerializer.serialize(suite1);

      // Create a fresh suite and resume
      const suite2 = create(() => {
        // Empty
      });
      SuiteSerializer.resume(suite2, serialized);

      // Immediately after resume, suite.get() should work correctly
      // This verifies that IsolateSerializer called useAddWatchedIsolate
      const result = suite2.get();
      expect(result.testCount).toBe(2);
      expect(result.errorCount).toBe(1);
      expect(result.hasErrors('field_a')).toBe(true);
      expect(result.hasErrors('field_b')).toBe(false);
    });

    it('should allow running new tests after resume that merge correctly', () => {
      const suite1 = create(() => {
        vestTest('field_a', () => {
          throw new Error('error a');
        });
      });

      suite1.run();
      const serialized = SuiteSerializer.serialize(suite1);

      // Create suite2 with additional test
      const suite2 = create(() => {
        vestTest('field_a', () => {
          throw new Error('error a');
        });
        vestTest('field_b', () => {
          throw new Error('error b');
        });
      });

      SuiteSerializer.resume(suite2, serialized);

      // Run the resumed suite
      suite2.run();
      const result = suite2.get();

      // Should have both tests
      expect(result.testCount).toBe(2);
      expect(result.hasErrors('field_a')).toBe(true);
      expect(result.hasErrors('field_b')).toBe(true);
    });

    // ERROR CASE: Invalid serialized data
    it('should handle corrupted serialized data gracefully', () => {
      const suite = create(() => {
        vestTest('field', () => {});
      });

      // Attempt to resume with invalid data - should throw
      expect(() => {
        SuiteSerializer.resume(suite, 'not valid json');
      }).toThrow();
    });
  });

  describe('Edge case: ALL_RUNNING_TESTS_FINISHED with resolver guard', () => {
    it('should not crash if resolver is called multiple times', async () => {
      const suite = create(() => {
        vestTest('async_test', async () => {
          await new Promise(resolve => setTimeout(resolve, 30));
        });
      });

      // Run multiple times quickly - should not crash
      // We only await the last one because previous runs are aborted
      // and their promises might reject or behave differently depending on abort handling.
      // The goal here is to ensure the suite doesn't crash internally.
      suite.run();
      await expect(suite.run()).resolves.toBeDefined();
    });

    // ERROR CASE: Suite with no async tests should still resolve
    it('should resolve immediately for sync-only suites', async () => {
      const suite = create(() => {
        vestTest('sync_test', () => {
          throw new Error('fail');
        });
      });

      // Updated to use Promise-based result instead of .done()
      const result = suite.run();
      await expect(result).resolves.toBeDefined();
    });
  });

  describe('Edge case: ISOLATE_RECONCILED adds cached subtree to watcher', () => {
    it('should include memoized tests in results after cache hit', () => {
      const suite = create((data: { value: string }) => {
        vestTest('non_memoized', () => {
          if (data.value !== 'valid') {
            throw new Error('invalid');
          }
        });

        memo(() => {
          vestTest('memoized_test', () => {
            if (data.value !== 'valid') {
              throw new Error('invalid');
            }
          });
        }, [data.value]);
      });

      // First run
      suite.run({ value: 'test1' });
      let result = suite.get();
      expect(result.testCount).toBe(2);
      expect(result.hasErrors('memoized_test')).toBe(true);

      // Second run - memo cache hit, but memoized test should still be in results
      suite.run({ value: 'test1' });
      result = suite.get();
      expect(result.testCount).toBe(2);
      expect(result.hasErrors('memoized_test')).toBe(true);
    });

    it('should include deeply nested memoized tests after cache hit', () => {
      const suite = create((data: { value: string }) => {
        memo(() => {
          group('memoized_group', () => {
            vestTest('deep_test_1', () => {
              throw new Error('fail');
            });
            vestTest('deep_test_2', () => {
              throw new Error('fail');
            });
          });
        }, [data.value]);
      });

      // First run
      suite.run({ value: 'stable' });
      let result = suite.get();
      expect(result.testCount).toBe(2);

      // Second run - cache hit
      suite.run({ value: 'stable' });
      result = suite.get();

      // Tests should still be accessible
      expect(result.testCount).toBe(2);
      expect(result.hasErrors('deep_test_1')).toBe(true);
      expect(result.hasErrors('deep_test_2')).toBe(true);
    });
  });

  describe('Edge case: Empty suite and watcher edge cases', () => {
    // ERROR CASE: Empty suite should not crash
    it('should handle empty suite gracefully', () => {
      const suite = create(() => {
        // No tests
      });

      const result = suite.run();
      expect(result.testCount).toBe(0);
      expect(result.valid).toBe(false); // Empty suite is invalid by default
    });

    // ERROR CASE: suite.get() before run() should not crash
    it('should handle suite.get() before run() gracefully', () => {
      const suite = create(() => {
        vestTest('field', () => {});
      });

      // Call get() without running first
      const result = suite.get();
      expect(result.testCount).toBe(0);
    });

    // ERROR CASE: Multiple rapid reset() calls
    it('should handle multiple rapid reset() calls', () => {
      const suite = create(() => {
        vestTest('field', () => {
          throw new Error('fail');
        });
      });

      suite.run();
      expect(suite.get().testCount).toBe(1);

      // Multiple resets
      suite.reset();
      suite.reset();
      suite.reset();

      // Should be empty
      expect(suite.get().testCount).toBe(0);
    });
  });

  describe('Edge case: Watcher with async tests that are canceled', () => {
    it('should not include canceled tests in final results', async () => {
      const suite = create((runAsync: boolean) => {
        // Run sync field FIRST to avoid Vest order error when async block is skipped
        vestTest('sync_field', () => {
          throw new Error('fail');
        });

        if (runAsync) {
          vestTest('async_field', async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            throw new Error('should not reach');
          });
        }
      });

      // First run with async test
      suite.run(true);
      expect(suite.get().tests.async_field?.pendingCount).toBe(1);

      // Immediately run again without async test - cancels the pending
      suite.run(false);

      // Wait for potential async completion
      await new Promise(resolve => setTimeout(resolve, 150));

      // Async test should be removed / canceled
      const result = suite.get();
      expect(result.testCount).toBe(1);
      expect(result.tests.async_field).toBeUndefined();
    });
  });
});
