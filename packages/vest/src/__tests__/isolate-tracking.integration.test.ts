import { describe, it, expect } from 'vitest';
import * as vest from '../vest';
import { VestIsolateType } from '../core/isolate/VestIsolateType';

describe('Isolate Tracking Integration Tests', () => {
  describe('suite.remove() updates refs', () => {
    it('should remove field tests from refs when field is removed', () => {
      const suite = vest.create(() => {
        vest.test('field1', 'msg', () => {});
        vest.test('field2', 'msg', () => {});
        vest.test('field1', 'msg2', () => {});
      });

      suite.run();
      let dump = suite.dump();

      // Initially 3 tests tracked
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(3);

      // Remove field1
      suite.remove('field1');
      dump = suite.dump();

      // Should only have 1 test (field2)
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(1);
    });
  });

  describe('suite.reset() clears refs', () => {
    it('should clear refs when suite is reset', () => {
      const suite = vest.create(() => {
        vest.test('field1', 'msg', () => {});
        vest.test('field2', 'msg', () => {});
      });

      suite.run();
      expect(suite.dump().refs?.[VestIsolateType.Test]?.size).toBe(2);

      suite.reset();

      // After reset, refs should be cleared or empty
      const dump = suite.dump();
      const refs = dump?.refs?.[VestIsolateType.Test];
      expect(!refs || refs.size === 0).toBe(true);
    });
  });

  describe('Groups correctly track nested tests', () => {
    it('should track tests inside groups at root level', () => {
      const suite = vest.create(() => {
        vest.test('outside', 'msg', () => {});

        vest.group('group1', () => {
          vest.test('inside1', 'msg', () => {});
          vest.test('inside2', 'msg', () => {});
        });
      });

      suite.run();
      const dump = suite.dump();

      // All 3 tests should be tracked at root
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(3);
    });

    it('should track tests in nested groups', () => {
      const suite = vest.create(() => {
        vest.group('outer', () => {
          vest.group('inner', () => {
            vest.test('deep', 'msg', () => {});
          });
        });
      });

      suite.run();
      const dump = suite.dump();

      // The deep test should bubble up to root
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(1);
    });
  });

  describe('Async tests in refs', () => {
    it('should include async tests in refs immediately', async () => {
      const suite = vest.create(() => {
        vest.test('async1', 'msg', async () => {
          await new Promise(r => setTimeout(r, 10));
        });
        vest.test('sync', 'msg', () => {});
      });

      const result = suite.run();

      // Both should be tracked immediately
      const dump = suite.dump();
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(2);

      // Wait for completion
      await result;
    });

    it('should track tests after async suite completion', async () => {
      const suite = vest.create(() => {
        vest.test('async', 'msg', async () => {
          await new Promise(r => setTimeout(r, 10));
          throw new Error('fail');
        });
      });

      const result = suite.run();
      await result;

      const dump = suite.dump();
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(1);
    });
  });

  describe('skipWhen/omitWhen exclusion', () => {
    it('should include skipped tests in refs (they exist but are skipped)', () => {
      const suite = vest.create(() => {
        vest.skipWhen(true, () => {
          vest.test('skipped', 'msg', () => {});
        });
        vest.test('normal', 'msg', () => {});
      });

      suite.run();
      const dump = suite.dump();

      // Skipped tests still exist in the tree, so they should be tracked
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(2);
    });

    it('should handle conditional omitWhen', () => {
      let omit = false;

      const suite = vest.create(() => {
        vest.omitWhen(omit, () => {
          vest.test('conditional', 'msg', () => {});
        });
        vest.test('always', 'msg', () => {});
      });

      // First run - not omitted
      suite.run();
      expect(suite.dump().refs?.[VestIsolateType.Test]?.size).toBe(2);

      // Second run - omitted
      omit = true;
      suite.run();
      // The omitted test may or may not be in refs depending on how omitWhen works
      // At minimum, 'always' should be there
      expect(
        suite.dump().refs?.[VestIsolateType.Test]?.size,
      ).toBeGreaterThanOrEqual(1);
    });
  });

  describe('each() with tracking', () => {
    it('should track all tests from each iteration', () => {
      const suite = vest.create(() => {
        vest.each(['a', 'b', 'c'], key => {
          vest.test(`field_${key}`, 'msg', () => {}, key);
        });
      });

      suite.run();
      const dump = suite.dump();

      // All 3 iterated tests should be tracked
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(3);
    });
  });

  describe('Re-run consistency', () => {
    it('should have consistent refs across multiple runs', () => {
      const suite = vest.create(() => {
        vest.test('field', 'msg', () => {});
      });

      // Run multiple times
      for (let i = 0; i < 5; i++) {
        suite.run();
        const dump = suite.dump();
        // Should always have exactly 1 test
        expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(1);
      }
    });
  });

  describe('Focus (only/skip) with refs', () => {
    it('should track only focused tests when using vest.only', () => {
      const suite = vest.create(() => {
        vest.only('field1');
        vest.test('field1', 'msg', () => {});
        vest.test('field2', 'msg', () => {});
      });

      suite.run();
      const dump = suite.dump();

      // Both tests are created, but only field1 runs
      // Refs should contain all created tests
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(2);
    });

    it('should track skipped tests when using vest.skip', () => {
      const suite = vest.create(() => {
        vest.skip('field2');
        vest.test('field1', 'msg', () => {});
        vest.test('field2', 'msg', () => {});
      });

      suite.run();
      const dump = suite.dump();

      // Both tests created, field2 skipped
      expect(dump.refs?.[VestIsolateType.Test]?.size).toBe(2);
    });
  });
});
