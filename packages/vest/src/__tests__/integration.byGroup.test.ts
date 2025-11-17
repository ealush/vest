import { describe, it, expect, beforeEach } from 'vitest';
import wait from 'wait';

import { TTestSuite } from '../testUtils/TVestMock';

import { Modes } from '../hooks/optional/Modes';
import { create, group, test, warn, skip, optional, only } from '../vest';
import * as vest from '../vest';

/**
 * Integration tests for byGroup selectors
 * These tests cover edge cases and integration scenarios across multiple selectors
 */
describe('Integration: byGroup selectors', () => {
  describe('Multiple groups share field names', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('group_1', () => {
          test('field_1', 'error in g1', () => false);
          test('field_2', () => {});
        });
        group('group_2', () => {
          test('field_1', () => {});
          test('field_2', 'error in g2', () => false);
        });
      });
    });

    it('should report errors only from the queried group in hasErrorsByGroup', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group_1')).toBe(true);
      expect(result.hasErrorsByGroup('group_1', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('group_1', 'field_2')).toBe(false);
      expect(result.hasErrorsByGroup('group_2')).toBe(true);
      expect(result.hasErrorsByGroup('group_2', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('group_2', 'field_2')).toBe(true);
    });

    it('should return only errors from the queried group in getErrorsByGroup', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('group_1')).toEqual({
        field_1: ['error in g1'],
      });
      expect(result.getErrorsByGroup('group_2')).toEqual({
        field_2: ['error in g2'],
      });
      expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
        'error in g1',
      ]);
      expect(result.getErrorsByGroup('group_2', 'field_2')).toEqual([
        'error in g2',
      ]);
    });

    it('should evaluate validity separately per group in isValidByGroup', () => {
      const result = suite.run();
      expect(result.isValidByGroup('group_1')).toBe(false);
      expect(result.isValidByGroup('group_2')).toBe(false);
      expect(result.isValidByGroup('group_1', 'field_1')).toBe(false);
      expect(result.isValidByGroup('group_1', 'field_2')).toBe(true);
      expect(result.isValidByGroup('group_2', 'field_1')).toBe(true);
      expect(result.isValidByGroup('group_2', 'field_2')).toBe(false);
    });
  });

  describe('Nested groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('outer', () => {
          test('field_1', 'outer error', () => false);
          group('inner', () => {
            test('field_2', 'inner error', () => false);
          });
        });
      });
    });

    it('should keep errors separate between nested groups', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('outer')).toBe(true);
      expect(result.hasErrorsByGroup('inner')).toBe(true);
      expect(result.getErrorsByGroup('outer', 'field_1')).toEqual([
        'outer error',
      ]);
      expect(result.getErrorsByGroup('inner', 'field_2')).toEqual([
        'inner error',
      ]);
    });
  });

  describe('Mixed errors and warnings in same group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('mixed_group', () => {
          test('field_1', 'error_msg', () => false);
          test('field_2', 'warning_msg', () => {
            warn();
            return false;
          });
          test('field_3', () => {});
        });
      });
    });

    it('should separate errors from warnings', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('mixed_group')).toBe(true);
      expect(result.hasWarningsByGroup('mixed_group')).toBe(true);
      expect(result.hasErrorsByGroup('mixed_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('mixed_group', 'field_2')).toBe(false);
      expect(result.hasWarningsByGroup('mixed_group', 'field_1')).toBe(false);
      expect(result.hasWarningsByGroup('mixed_group', 'field_2')).toBe(true);
    });

    it('should return separate maps from getErrorsByGroup and getWarningsByGroup', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('mixed_group')).toEqual({
        field_1: ['error_msg'],
      });
      expect(result.getWarningsByGroup('mixed_group')).toEqual({
        field_2: ['warning_msg'],
      });
      expect(result.getErrorsByGroup('mixed_group', 'field_1')).toEqual([
        'error_msg',
      ]);
      expect(result.getWarningsByGroup('mixed_group', 'field_2')).toEqual([
        'warning_msg',
      ]);
    });
  });

  describe('Multiple tests for the same field in a group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('group_1', () => {
          test('field_1', 'error 1', () => false);
          test('field_1', 'error 2', () => false);
          test('field_1', 'error 3', () => false);
        });
      });
    });

    it('should collect all errors from repeated tests of the same field', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group_1', 'field_1')).toBe(true);
      expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
        'error 1',
        'error 2',
        'error 3',
      ]);
    });

    describe('With mixed results', () => {
      beforeEach(() => {
        suite = create(() => {
          vest.mode(Modes.ALL);
          group('group_1', () => {
            test('field_1', 'error 1', () => false);
            test('field_1', () => {});
            test('field_1', 'error 2', () => false);
          });
        });
      });

      it('should ignore passing tests when collecting errors', () => {
        const result = suite.run();
        expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
          'error 1',
          'error 2',
        ]);
      });
    });
  });

  describe('Empty group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('empty_group', () => {
          // no tests
        });
        group('another_group', () => {
          test('field_1', () => false);
        });
      });
    });

    it('should treat an empty group as valid with no errors or warnings', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('empty_group')).toBe(false);
      expect(result.hasWarningsByGroup('empty_group')).toBe(false);
      expect(result.getErrorsByGroup('empty_group')).toEqual({});
      expect(result.getWarningsByGroup('empty_group')).toEqual({});
      expect(result.isValidByGroup('empty_group')).toBe(true);
    });
  });

  describe('Async tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('async_group', () => {
          test('field_1', 'field_1 error', async () => {
            await wait(100);
            throw new Error();
          });
          test('field_2', 'field_2 warning', async () => {
            warn();
            await wait(100);
            throw new Error();
          });
          test('field_3', async () => {
            await wait(100);
          });
        });
      });
    });

    it('should mark group invalid while async tests are pending', () => {
      const result = suite.run();
      expect(result.isValidByGroup('async_group')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_1')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_2')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_3')).toBe(false);
    });

    it('should update errors, warnings and validity after async tests finish', async () => {
      await suite.run();
      const result = suite.get();
      expect(result.hasErrorsByGroup('async_group')).toBe(true);
      expect(result.hasWarningsByGroup('async_group')).toBe(true);
      expect(result.hasErrorsByGroup('async_group', 'field_1')).toBe(true);
      expect(result.hasWarningsByGroup('async_group', 'field_2')).toBe(true);
      expect(result.getErrorsByGroup('async_group', 'field_1')).toHaveLength(1);
      expect(result.getWarningsByGroup('async_group', 'field_2')).toHaveLength(
        1,
      );
      expect(result.isValidByGroup('async_group')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_3')).toBe(true);
    });
  });

  describe('Skipped tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((skipField: string) => {
        skip(skipField);
        group('skip_group', () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('field_3', () => {});
        });
      });
    });

    it('should not count skipped tests as errors', () => {
      const result = suite.run('field_1');
      expect(result.hasErrorsByGroup('skip_group')).toBe(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
    });

    it('should exclude skipped tests from getErrorsByGroup', () => {
      const result = suite.run('field_1');
      const errors = result.getErrorsByGroup('skip_group');
      expect(errors).not.toHaveProperty('field_1');
      expect(errors).toHaveProperty('field_2');
    });

    it('should mark group invalid when required tests are skipped', () => {
      const result = suite.run('field_1');
      expect(result.isValidByGroup('skip_group')).toBe(false);
      expect(result.isValidByGroup('skip_group', 'field_1')).toBe(false);
    });
  });

  describe('Optional tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        optional({ field_1: false, field_2: false });
        group('optional_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'error 2', () => false);
        });
      });
    });

    it('should report errors for non-optional fields', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('optional_group')).toBe(true);
      expect(result.hasErrorsByGroup('optional_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('optional_group', 'field_2')).toBe(true);
      expect(result.getErrorsByGroup('optional_group', 'field_1')).toEqual([
        'error 1',
      ]);
    });

    it('should mark group invalid when non-optional fields fail', () => {
      const result = suite.run();
      expect(result.isValidByGroup('optional_group')).toBe(false);
      expect(result.isValidByGroup('optional_group', 'field_1')).toBe(false);
      expect(result.isValidByGroup('optional_group', 'field_2')).toBe(false);
    });
  });

  describe('Only mode with groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((onlyField: string) => {
        only(onlyField);
        group('only_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'error 2', () => false);
          test('field_3', () => {});
        });
      });
    });

    it('should run tests only for the field focused by only()', () => {
      const result = suite.run('field_1');
      expect(result.hasErrorsByGroup('only_group')).toBe(true);
      expect(result.hasErrorsByGroup('only_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('only_group', 'field_2')).toBe(false);
      const errors = result.getErrorsByGroup('only_group');
      expect(errors).toHaveProperty('field_1');
      expect(errors).not.toHaveProperty('field_2');
    });
  });

  describe('Tests without messages in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('no_message_group', () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('field_3', 'has message', () => false);
        });
      });
    });

    it('should detect errors even when tests have no messages', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('no_message_group')).toBe(true);
      expect(result.hasErrorsByGroup('no_message_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('no_message_group', 'field_2')).toBe(true);
    });

    it('should return an empty array for errors without messages in getErrorsByGroup', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('no_message_group', 'field_1')).toEqual(
        [],
      );
      expect(result.getErrorsByGroup('no_message_group', 'field_2')).toEqual(
        [],
      );
      expect(result.getErrorsByGroup('no_message_group', 'field_3')).toEqual([
        'has message',
      ]);
    });
  });

  describe('omitWhen in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((shouldOmit: boolean) => {
        group('omit_group', () => {
          vest.omitWhen(shouldOmit, () => {
            test('field_1', 'omitted error', () => false);
          });
          test('field_2', 'regular error', () => false);
        });
      });
    });

    it('should exclude the test from running and from errors when omitWhen(true)', () => {
      const result = suite.run(true);
      expect(result.hasErrorsByGroup('omit_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('omit_group', 'field_2')).toBe(true);
      expect(result.isValidByGroup('omit_group', 'field_1')).toBe(true);
    });

    it('should run the test and report its errors when omitWhen(false)', () => {
      const result = suite.run(false);
      expect(result.hasErrorsByGroup('omit_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('omit_group', 'field_2')).toBe(true);
    });
  });

  describe('skipWhen in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((shouldSkip: boolean) => {
        group('skip_group', () => {
          vest.skipWhen(shouldSkip, () => {
            test('field_1', 'skipped error', () => false);
          });
          test('field_2', 'regular error', () => false);
        });
      });
    });

    it('should skip the test when skipWhen(true); skipped test still affects validity', () => {
      const result = suite.run(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
      expect(result.isValidByGroup('skip_group', 'field_1')).toBe(false);
    });

    it('should run the test and collect errors when skipWhen(false)', () => {
      const result = suite.run(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
    });
  });

  describe('SuiteResult vs SuiteRunResult consistency', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('consistency_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'warning 1', () => {
            warn();
            return false;
          });
        });
      });
    });

    it('should return consistent group data from run() and get()', () => {
      const runResult = suite.run();
      const getResult = suite.get();

      expect(runResult.hasErrorsByGroup('consistency_group')).toBe(
        getResult.hasErrorsByGroup('consistency_group'),
      );
      expect(runResult.hasWarningsByGroup('consistency_group')).toBe(
        getResult.hasWarningsByGroup('consistency_group'),
      );
      expect(runResult.getErrorsByGroup('consistency_group')).toEqual(
        getResult.getErrorsByGroup('consistency_group'),
      );
      expect(runResult.getWarningsByGroup('consistency_group')).toEqual(
        getResult.getWarningsByGroup('consistency_group'),
      );
      expect(runResult.isValidByGroup('consistency_group')).toBe(
        getResult.isValidByGroup('consistency_group'),
      );
    });
  });

  describe('Special characters in group and field names', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('group-with-dashes', () => {
          test('field.with.dots', 'error 1', () => false);
          test('field_with_underscores', () => {});
        });
        group('group with spaces', () => {
          test('field-1', 'error 2', () => false);
        });
      });
    });

    it('should handle dashes, spaces, dots and underscores in names', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group-with-dashes')).toBe(true);
      expect(
        result.hasErrorsByGroup('group-with-dashes', 'field.with.dots'),
      ).toBe(true);
      expect(result.hasErrorsByGroup('group with spaces')).toBe(true);
      expect(result.hasErrorsByGroup('group with spaces', 'field-1')).toBe(
        true,
      );
    });
  });

  describe('Large number of fields in a group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('large_group', () => {
          for (let i = 0; i < 100; i++) {
            test(`field_${i}`, `error ${i}`, () => i % 2 === 0);
          }
        });
      });
    });

    it('should handle large groups and report errors only for failing fields', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('large_group')).toBe(true);
      const errors = result.getErrorsByGroup('large_group');
      expect(Object.keys(errors).length).toBe(50);
      expect(result.hasErrorsByGroup('large_group', 'field_0')).toBe(false);
      expect(result.hasErrorsByGroup('large_group', 'field_1')).toBe(true);
      expect(result.getErrorsByGroup('large_group', 'field_1')).toEqual([
        'error 1',
      ]);
    });
  });

  describe('Group with all passing tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('passing_group', () => {
          test('field_1', () => {});
          test('field_2', () => true);
          test('field_3', () => {});
        });
      });
    });

    it('should be valid when all tests in the group pass', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('passing_group')).toBe(false);
      expect(result.hasWarningsByGroup('passing_group')).toBe(false);
      expect(result.getErrorsByGroup('passing_group')).toEqual({});
      expect(result.getWarningsByGroup('passing_group')).toEqual({});
      expect(result.isValidByGroup('passing_group')).toBe(true);
    });
  });

  describe('Mixed synchronous and asynchronous tests in group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('mixed_async_group', () => {
          test('sync_field', 'sync error', () => false);
          test('async_field', async () => {
            await wait(100);
            throw new Error();
          });
        });
      });
    });

    it('should show sync errors immediately; pending async tests are not errors yet', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('mixed_async_group', 'sync_field')).toBe(
        true,
      );
      expect(result.hasErrorsByGroup('mixed_async_group', 'async_field')).toBe(
        false,
      );
    });

    it('should show async errors after the async test finishes', async () => {
      suite.run();
      await wait(150);
      const result = suite.get();
      expect(result.hasErrorsByGroup('mixed_async_group', 'sync_field')).toBe(
        true,
      );
      expect(result.hasErrorsByGroup('mixed_async_group', 'async_field')).toBe(
        true,
      );
    });
  });
});
