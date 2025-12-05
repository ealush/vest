import { describe, it, expect } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';
import * as vest from '../../vest';

describe('suite.focus: only', () => {
  it('focus should be a function', () => {
    const suite = vest.create(() => {});

    expect(suite.focus).toBeTypeOf('function');
  });

  describe('focus return value', () => {
    it('should be the rest of the suite methods', () => {
      const suite = vest.create(() => {});

      const focused = suite.focus({ only: ['field_1'] });

      expect(focused).toBeTypeOf('object');
      expect(focused.afterEach).toBeTypeOf('function');
      expect(focused.afterField).toBeTypeOf('function');
      expect(focused.run).toBeTypeOf('function');
      expect(focused).toMatchSnapshot();
    });
  });

  describe('behavior', () => {
    it('should focus on the specified field when a single field is provided', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ only: 'field_1' }).run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(false);

      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(0);
    });

    it('should focus on the specified fields when multiple fields are provided', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ only: ['field_1', 'field_3'] }).run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(true);

      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(1);
    });

    describe('multiple runs', () => {
      it('should reevaluate the focused fields on each run', () => {
        const suite = vest.create(() => {
          dummyTest.failing('field_1');
          dummyTest.failing('field_2');
          dummyTest.failing('field_3');
        });

        suite.focus({ only: 'field_1' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(false);
        expect(suite.hasErrors('field_3')).toBe(false);

        suite.focus({ only: 'field_2' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(true);
        expect(suite.hasErrors('field_3')).toBe(false);

        suite.focus({ only: 'field_3' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(true);
        expect(suite.hasErrors('field_3')).toBe(true);
      });

      it('should not persist focus from one run to the next', () => {
        const suite = vest.create(
          (data = {} as { f1?: number; f2?: number }) => {
            vest.test('f1', 'f1 is required', () => {
              vest.enforce(data.f1).isNotEmpty();
            });
            vest.test('f2', 'f2 is required', () => {
              vest.enforce(data.f2).isNotEmpty();
            });
          },
        );

        // 1. Run with focus on f1 - should not get errors for f1 (it's skipped)
        const focusedResult = suite.focus({ only: 'f1' }).run({});
        expect(focusedResult.hasErrors('f1')).toBe(true);
        expect(focusedResult.hasErrors('f2')).toBe(false);
        expect(focusedResult.tests.f1.testCount).toBe(1);
        expect(focusedResult.tests.f2.testCount).toBe(0);

        // 2. Run without focus - should now get errors for both f1 and f2
        const unfocusedResult = suite.run({});
        expect(unfocusedResult.hasErrors('f1')).toBe(true);
        expect(unfocusedResult.hasErrors('f2')).toBe(true);
        expect(unfocusedResult.isValid()).toBe(false);
        expect(unfocusedResult.tests.f1.testCount).toBe(1);
        expect(unfocusedResult.tests.f2.testCount).toBe(1);
        // 3. Run without focus but with valid data - should be valid
        const validResult = suite.run({ f1: 1, f2: 2 });
        expect(validResult.hasErrors('f1')).toBe(false);
        expect(validResult.hasErrors('f2')).toBe(false);
        expect(validResult.isValid()).toBe(true);
      });
    });
  });
});
