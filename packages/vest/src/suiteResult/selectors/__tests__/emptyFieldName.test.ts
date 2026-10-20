import { describe, it, expect } from 'vitest';

import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from '../../../vest';

// Regression tests for #1349: an empty string ('') is a valid field name
// and must be looked up as a field, not treated as "no field passed".
describe('Selectors with an empty string field name', () => {
  const EMPTY = '';
  const OTHER = 'other';
  const GROUP = 'group_name';

  // '' passes, while another field fails. Any selector that falls back to the
  // suite-wide lookup for '' will report the other field's failures.
  function errorSuite() {
    return vest.create(() => {
      dummyTest.passing(EMPTY);
      dummyTest.failing(OTHER, 'other error');
    });
  }

  function warningSuite() {
    return vest.create(() => {
      dummyTest.passing(EMPTY);
      dummyTest.failingWarning(OTHER, 'other warning');
    });
  }

  function groupSuite() {
    return vest.create(() => {
      vest.group(GROUP, () => {
        dummyTest.passing(EMPTY);
        dummyTest.failing(OTHER, 'other error');
        dummyTest.failingWarning('warned', 'other warning');
      });
    });
  }

  describe('Sanity', () => {
    it('Should record tests registered under the empty string field', () => {
      const res = errorSuite().run();
      expect(res.tests[EMPTY]).toBeDefined();
      expect(res.tests[EMPTY].testCount).toBe(1);
      expect(res.tests[EMPTY].errorCount).toBe(0);
    });
  });

  describe('When passing an empty string', () => {
    it('isValid("") should only check the "" field', () => {
      const suite = errorSuite();
      const res = suite.run();
      expect(res.isValid(EMPTY)).toBe(true);
      expect(suite.get().isValid(EMPTY)).toBe(true);
    });

    it('hasErrors("") should only check the "" field', () => {
      const suite = errorSuite();
      const res = suite.run();
      expect(res.hasErrors(EMPTY)).toBe(false);
      expect(suite.get().hasErrors(EMPTY)).toBe(false);
    });

    it('getErrors("") should return the "" field errors array', () => {
      const res = errorSuite().run();
      expect(res.getErrors(EMPTY)).toEqual([]);
    });

    it('getError("") should return the first "" field error', () => {
      const res = errorSuite().run();
      expect(res.getError(EMPTY)).toBeUndefined();
    });

    it('hasWarnings("") should only check the "" field', () => {
      const res = warningSuite().run();
      expect(res.hasWarnings(EMPTY)).toBe(false);
    });

    it('getWarnings("") should return the "" field warnings array', () => {
      const res = warningSuite().run();
      expect(res.getWarnings(EMPTY)).toEqual([]);
    });

    it('getWarning("") should return the first "" field warning', () => {
      const res = warningSuite().run();
      expect(res.getWarning(EMPTY)).toBeUndefined();
    });

    it('isPending("") should only check the "" field', () => {
      const suite = vest.create(() => {
        dummyTest.passing(EMPTY);
        dummyTest.passingAsync(OTHER);
      });
      const res = suite.run();
      expect(res.isPending(EMPTY)).toBe(false);
    });

    it('isTested("") should return true when the "" field was tested', () => {
      const res = errorSuite().run();
      expect(res.isTested(EMPTY)).toBe(true);
    });

    describe('ByGroup selectors', () => {
      it('isValidByGroup(group, "") should only check the "" field', () => {
        const res = groupSuite().run();
        expect(res.isValidByGroup(GROUP, EMPTY)).toBe(true);
      });

      it('hasErrorsByGroup(group, "") should only check the "" field', () => {
        const res = groupSuite().run();
        expect(res.hasErrorsByGroup(GROUP, EMPTY)).toBe(false);
      });

      it('hasWarningsByGroup(group, "") should only check the "" field', () => {
        const res = groupSuite().run();
        expect(res.hasWarningsByGroup(GROUP, EMPTY)).toBe(false);
      });

      it('getErrorsByGroup(group, "") should return the "" field errors array', () => {
        const res = groupSuite().run();
        expect(res.getErrorsByGroup(GROUP, EMPTY)).toEqual([]);
      });

      it('getWarningsByGroup(group, "") should return the "" field warnings array', () => {
        const res = groupSuite().run();
        expect(res.getWarningsByGroup(GROUP, EMPTY)).toEqual([]);
      });
    });
  });

  describe('When passing no field name (existing behavior)', () => {
    it('isValid() should check the whole suite', () => {
      const res = errorSuite().run();
      expect(res.isValid()).toBe(false);
    });

    it('hasErrors() should check the whole suite', () => {
      const res = errorSuite().run();
      expect(res.hasErrors()).toBe(true);
    });

    it('getErrors() should return errors for all fields', () => {
      const res = errorSuite().run();
      expect(res.getErrors()).toMatchObject({ [OTHER]: ['other error'] });
    });

    it('getError() should return the first error in the suite', () => {
      const res = errorSuite().run();
      expect(res.getError()).toMatchObject({
        fieldName: OTHER,
        message: 'other error',
      });
    });

    it('hasWarnings() should check the whole suite', () => {
      const res = warningSuite().run();
      expect(res.hasWarnings()).toBe(true);
    });

    it('getWarnings() should return warnings for all fields', () => {
      const res = warningSuite().run();
      expect(res.getWarnings()).toMatchObject({ [OTHER]: ['other warning'] });
    });

    it('getWarning() should return the first warning in the suite', () => {
      const res = warningSuite().run();
      expect(res.getWarning()).toMatchObject({
        fieldName: OTHER,
        message: 'other warning',
      });
    });

    it('isPending() should check the whole suite', () => {
      const suite = vest.create(() => {
        dummyTest.passing(EMPTY);
        dummyTest.passingAsync(OTHER);
      });
      const res = suite.run();
      expect(res.isPending()).toBe(true);
    });

    describe('ByGroup selectors', () => {
      it('isValidByGroup(group) should check the whole group', () => {
        const res = groupSuite().run();
        expect(res.isValidByGroup(GROUP)).toBe(false);
      });

      it('hasErrorsByGroup(group) should check the whole group', () => {
        const res = groupSuite().run();
        expect(res.hasErrorsByGroup(GROUP)).toBe(true);
      });

      it('hasWarningsByGroup(group) should check the whole group', () => {
        const res = groupSuite().run();
        expect(res.hasWarningsByGroup(GROUP)).toBe(true);
      });

      it('getErrorsByGroup(group) should return errors for all group fields', () => {
        const res = groupSuite().run();
        expect(res.getErrorsByGroup(GROUP)).toMatchObject({
          [OTHER]: ['other error'],
        });
      });

      it('getWarningsByGroup(group) should return warnings for all group fields', () => {
        const res = groupSuite().run();
        expect(res.getWarningsByGroup(GROUP)).toMatchObject({
          warned: ['other warning'],
        });
      });
    });
  });
});
