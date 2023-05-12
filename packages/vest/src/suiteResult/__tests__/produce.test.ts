import { ser } from '../../../testUtils/suiteDummy';
import { dummyTest } from '../../../testUtils/testDummy';

import { Modes } from 'mode';
import * as vest from 'vest';

describe('produce method Suite Result', () => {
  describe('Base structure', () => {
    it('Should match snapshot', () => {
      const suite = vest.create(() => {});
      expect(suite()).toMatchObject({
        errorCount: 0,
        groups: {},
        testCount: 0,
        tests: {},
        warnCount: 0,
      });
      expect(ser(suite())).toEqual(ser(suite.get()));
    });

    it('Its methods should reflect the correct test data', () => {
      const suite = vest.create(() => {
        vest.mode(Modes.ALL);
        dummyTest.passing('field_1');
        dummyTest.failing('field_1', 'message');
        dummyTest.failing('field_1', 'failure_message');
        dummyTest.failing('field_1', 'failure_message with group', 'group_1');
        dummyTest.failingWarning('field_2', 'warning test');
        dummyTest.failingWarning('field_2', 'another warning test');
        dummyTest.passing('field_2');
        dummyTest.passing('field_3', '', 'group_1');
        dummyTest.failing('field_3', 'msg');
        dummyTest.passing('field_4');
        dummyTest.passing('field_5', '', 'group_2');
        dummyTest.failingWarning('field_5', 'warning message', 'group_2');
      });

      const res = suite();

      expect(ser(suite.get())).toEqual(ser(res));

      expect(res.hasErrors()).toBe(true);
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(true);
      expect(res.hasErrors('field_4')).toBe(false);
      expect(res.hasErrors('field_5')).toBe(false);
      expect(res.hasWarnings('field_1')).toBe(false);
      expect(res.hasWarnings('field_2')).toBe(true);
      expect(res.hasWarnings('field_3')).toBe(false);
      expect(res.hasWarnings('field_4')).toBe(false);
      expect(res.hasWarnings('field_5')).toBe(true);
      expect(res.getErrors()).toEqual({
        field_1: ['message', 'failure_message', 'failure_message with group'],
        field_3: ['msg'],
      });
      expect(res.getWarnings()).toEqual({
        field_2: ['warning test', 'another warning test'],
        field_5: ['warning message'],
      });
      expect(res.getErrors()).toEqual({
        field_1: ['message', 'failure_message', 'failure_message with group'],
        field_3: ['msg'],
      });
      expect(res.hasErrorsByGroup('group_1')).toBe(true);
      expect(res.hasErrorsByGroup('group_1', 'field_1')).toBe(true);
      expect(res.hasErrorsByGroup('group_2')).toBe(false);
      expect(res.hasErrorsByGroup('group_1', 'field_2')).toBe(false);
      expect(res.hasErrorsByGroup('group_3')).toBe(false);
      expect(res.hasWarningsByGroup('group_1')).toBe(false);
      expect(res.hasWarningsByGroup('group_1', 'field_1')).toBe(false);
      expect(res.hasWarningsByGroup('group_2')).toBe(true);
      expect(res.hasWarningsByGroup('group_1', 'field_2')).toBe(false);
      expect(res.hasWarningsByGroup('group_2', 'field_5')).toBe(true);
    });
  });

  describe('Value memoization', () => {
    it('When unchanged, should produce a memoized result', () => {
      const suite = vest.create(() => {
        dummyTest.passing('field_1');
        dummyTest.failing('field_1', 'message');
      });
      const res = suite();
      expect(res.tests).toBe(suite.get().tests);
      expect(res.errors).toBe(suite.get().errors);
      expect(res.warnings).toBe(suite.get().warnings);
      expect(res.groups).toBe(suite.get().groups);
    });

    it('When changed, should produce a new result object', () => {
      const suite = vest.create((v1, v2) => {
        vest.test('f1', () => {
          vest.enforce(v1).equals(1);
        });
        vest.test('f2', () => {
          vest.enforce(v2).equals(2);
        });
      });
      const res1 = suite(1, 2);
      const res2 = suite(1, 1);
      suite(2, 1);
      expect(res1).not.toMatchObject(suite.get());
      expect(res1).not.toBe(suite.get());
      expect(res2).not.toMatchObject(suite.get());
      expect(res2).not.toBe(suite.get());
    });
  });
});

describe('suite.get()', () => {
  describe('exposed methods', () => {
    it('Should have all exposed methods', () => {
      const suite = vest.create(() => {});
      expect(suite.get()).toMatchInlineSnapshot(`
        {
          "errorCount": 0,
          "errors": [],
          "getError": [Function],
          "getErrors": [Function],
          "getErrorsByGroup": [Function],
          "getWarning": [Function],
          "getWarnings": [Function],
          "getWarningsByGroup": [Function],
          "groups": {},
          "hasErrors": [Function],
          "hasErrorsByGroup": [Function],
          "hasWarnings": [Function],
          "hasWarningsByGroup": [Function],
          "isValid": [Function],
          "isValidByGroup": [Function],
          "suiteName": undefined,
          "testCount": 0,
          "tests": {},
          "valid": false,
          "warnCount": 0,
          "warnings": [],
        }
      `);
    });
  });
});

describe('suite()', () => {
  describe('exposed methods', () => {
    it('Should have all exposed methods', () => {
      expect(vest.create(() => {})()).toMatchInlineSnapshot(`
        {
          "done": [Function],
          "errorCount": 0,
          "errors": [],
          "getError": [Function],
          "getErrors": [Function],
          "getErrorsByGroup": [Function],
          "getWarning": [Function],
          "getWarnings": [Function],
          "getWarningsByGroup": [Function],
          "groups": {},
          "hasErrors": [Function],
          "hasErrorsByGroup": [Function],
          "hasWarnings": [Function],
          "hasWarningsByGroup": [Function],
          "isValid": [Function],
          "isValidByGroup": [Function],
          "suiteName": undefined,
          "testCount": 0,
          "tests": {},
          "valid": false,
          "warnCount": 0,
          "warnings": [],
        }
      `);
    });
  });
});
