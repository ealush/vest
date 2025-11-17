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
      expect(focused.after).toBeTypeOf('function');
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
    });
  });
});
