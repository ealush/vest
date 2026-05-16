import { describe, it, expect, vi } from 'vitest';

import { VestTest } from '../../core/isolate/IsolateTest/VestTest';
import { ErrorStrings } from '../../errors/ErrorStrings';
import * as vest from '../../vest';

const { create, test, success } = vest;

describe('success hook', () => {
  describe('When currentTest exists', () => {
    it('should set success severity for the current test', () => {
      let t;
      create(() => {
        t = test('test_1', 'some message', () => {
          success();
        });
      }).run();

      expect(
        VestTest.isSuccessSeverity(VestTest.cast(t).unwrap()).unwrap(),
      ).toBe(true);
    });
  });

  describe('Suite result behavior', () => {
    it('should add test message to suite successes when a successful test passes', () => {
      const suite = create(() => {
        test('field_1', 'passes with success', () => {
          success();
        });

        test('field_2', 'regular pass', () => {});
      });

      const res = suite.run();
      expect(res.isValid()).toBe(true);
      expect(res.hasSuccesses('field_1')).toBe(true);
      expect(res.getSuccess('field_1')).toBe('passes with success');
      expect(res.getSuccesses('field_1')).toEqual(['passes with success']);
      expect(res.hasSuccesses('field_2')).toBe(false);
      expect(res.getSuccess('field_2')).toBeUndefined();
    });

    it('should NOT add test message to suite successes when a successful test fails', () => {
      const suite = create(() => {
        test('field_1', 'fails with success', () => {
          success();
          return false;
        });
      });

      const res = suite.run();
      expect(res.isValid()).toBe(false);
      expect(res.hasSuccesses('field_1')).toBe(false);
      expect(res.getSuccess('field_1')).toBeUndefined();
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.getError('field_1')).toBe('fails with success');
    });

    it('should expose hasSuccesses correctly at the suite level', () => {
      const suite = create(() => {
        test('field_1', 'passes with success', () => {
          success();
        });
      });

      const res = suite.run();
      expect(res.hasSuccesses()).toBe(true);
      expect(res.getSuccesses()).toEqual({ field_1: ['passes with success'] });
      expect(res.getSuccess()).toEqual(
        expect.objectContaining({ message: 'passes with success' }),
      );
    });

    it('should expose getMessage correctly for successful tests', () => {
      const suite = create(() => {
        test('field_1', 'passes with success message', () => {
          success();
        });

        test('field_2', 'fails with error', () => {
          return false;
        });

        test('field_3', 'fails with warning', () => {
          vest.warn();
          return false;
        });
      });

      const res = suite.run();
      expect(res.getMessage('field_1')).toBe('passes with success message');
      expect(res.getMessage('field_2')).toBe('fails with error');
      expect(res.getMessage('field_3')).toBe('fails with warning');
    });

    it('should allow getting successes by group', () => {
      const suite = create(() => {
        vest.group('group_1', () => {
          test('field_1', 'passes with success in group', () => {
            success();
          });
          test('field_2', 'regular pass in group', () => {});
        });
      });

      const res = suite.run();
      expect(res.hasSuccessesByGroup('group_1')).toBe(true);
      expect(res.hasSuccessesByGroup('group_1', 'field_1')).toBe(true);
      expect(res.hasSuccessesByGroup('group_1', 'field_2')).toBe(false);
      expect(res.getSuccessesByGroup('group_1')).toEqual({
        field_1: ['passes with success in group'],
      });
      expect(res.getSuccessesByGroup('group_1', 'field_1')).toEqual([
        'passes with success in group',
      ]);
      expect(res.getSuccessesByGroup('group_1', 'field_2')).toEqual([]);
    });
  });

  describe('Error handling', () => {
    it('should throw when called outside a test body', () => {
      const done = vi.fn();
      create(() => {
        expect(success).toThrow(ErrorStrings.USE_WARN_MUST_BE_CALLED_FROM_TEST);
        done();
      }).run();
      expect(done).toHaveBeenCalled();
    });

    it('should throw when called without an active suite', () => {
      expect(success).toThrow(ErrorStrings.HOOK_CALLED_OUTSIDE);
    });
  });
});
