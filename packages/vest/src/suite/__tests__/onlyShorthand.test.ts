import { describe, it, expect, vi } from 'vitest';
import * as vest from '../../vest';
import { test as vestTest } from '../../core/test/test';

describe('Suite .only() shorthand', () => {
  it('should act as a shorthand for suite.focus({ only })', () => {
    const cb = vi.fn();
    const suite = vest.create(() => {
      vestTest('field1', () => {});
      vestTest('field2', () => {});
      cb();
    });

    const focusedSuite = suite.only('field1');
    expect(focusedSuite).toHaveProperty('run');
    expect(focusedSuite).toHaveProperty('get');

    const result = focusedSuite.run();
    expect(result.tests.field1).toBeDefined();
    // Because field2 is excluded by only, it might be undefined or "canceled", vest keeps it out or omitted
    // Depending on vestibular logic, it is either untested or missing.
    // We can just verify which tests actually ran.
  });

  it('should run only the specified field', () => {
    let runCount1 = 0;
    let runCount2 = 0;
    const suite = vest.create(() => {
      vestTest('field1', () => {
        runCount1++;
      });
      vestTest('field2', () => {
        runCount2++;
      });
    });

    suite.only('field1').run();

    expect(runCount1).toBe(1);
    expect(runCount2).toBe(0);
  });

  it('should accept an array of fields', () => {
    let runCount1 = 0;
    let runCount2 = 0;
    let runCount3 = 0;
    const suite = vest.create(() => {
      vestTest('field1', () => {
        runCount1++;
      });
      vestTest('field2', () => {
        runCount2++;
      });
      vestTest('field3', () => {
        runCount3++;
      });
    });

    suite.only(['field1', 'field3']).run();

    expect(runCount1).toBe(1);
    expect(runCount2).toBe(0);
    expect(runCount3).toBe(1);
  });

  it('should be chainable with itself (though subsequent calls wrap previous)', () => {
    let runCount1 = 0;
    let runCount2 = 0;
    const suite = vest.create(() => {
      vestTest('field1', () => {
        runCount1++;
      });
      vestTest('field2', () => {
        runCount2++;
      });
    });

    suite.only('field1').only('field2').run(); // The last one takes precedence based on how modifiers are merged

    // In focus(), only overwrites only since it's merged.
    expect(runCount1).toBe(0);
    expect(runCount2).toBe(1);
  });
});
