import { describe, it, expect } from 'vitest';
import * as vest from '../../vest';
import { test as vestTest } from '../../core/test/test';

describe('Suite .only() shorthand', () => {
  it('should act as a shorthand for suite.focus({ only })', () => {
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

    const focusedSuite = suite.only('field1');
    expect(focusedSuite).toHaveProperty('run');
    expect(focusedSuite).toHaveProperty('get');

    focusedSuite.run();
    expect(runCount1).toBe(1);
    expect(runCount2).toBe(0);
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

  it('should let subsequent only() calls overwrite previous ones', () => {
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

    // The last only() call overwrites the previous one - field2 wins
    suite.only('field1').only('field2').run();

    expect(runCount1).toBe(0);
    expect(runCount2).toBe(1);
  });
});
