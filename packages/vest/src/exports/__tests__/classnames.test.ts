import { describe, it, expect, vi } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';
import classnames from '../classnames';

import { Modes } from 'Modes';
import * as vest from 'vest';

describe('Utility: classnames', () => {
  describe('When called without a vest result object', () => {
    it('should throw an error', () => {
      expect(classnames).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => classnames({})).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => classnames([])).toThrow();
      // @ts-expect-error - testing invalid input
      expect(() => classnames('invalid')).toThrow();
    });
  });

  describe('When called with a vest result object', () => {
    it('should return a function', async () => {
      const suite = vest.create(
        vi.fn(() => {
          dummyTest.failing('field_0');
        }),
      );
      expect(typeof classnames(suite.run())).toBe('function');
      const promisifed = await vest
        .create(
          vi.fn(() => {
            dummyTest.failing('field_0');
          }),
        )
        .run();
      expect(typeof classnames(promisifed)).toBe('function');
    });
  });

  const suite = vest.create(() => {
    vest.mode(Modes.ALL);
    vest.skip('field_1');

    dummyTest.failing('field_1');
    dummyTest.failing('field_2');
    dummyTest.failingWarning('field_2');
    dummyTest.failingWarning('field_3');
    dummyTest.passing('field_4');
    dummyTest.failing('field_5');
  });

  const res = suite.run();

  describe('when all keys are provided', () => {
    const genClass = classnames(res, {
      invalid: 'invalid_string',
      pending: 'pending_string',
      tested: 'tested_string',
      untested: 'untested_string',
      valid: 'valid_string',
      warning: 'warning_string',
    });

    it('should produce a string matching the classnames object for each field', () => {
      expect(genClass('field_1')).toBe('untested_string');

      // splitting and sorting to not rely on object order which is unspecified in the language
      expect(genClass('field_2').split(' ').sort()).toEqual(
        'invalid_string tested_string warning_string'.split(' ').sort(),
      );
      expect(genClass('field_3').split(' ').sort()).toEqual(
        'tested_string valid_string warning_string'.split(' ').sort(),
      );
      expect(genClass('field_4').split(' ').sort()).toEqual(
        'tested_string valid_string'.split(' ').sort(),
      );

      expect(genClass('field_5').split(' ').sort()).toEqual(
        'tested_string invalid_string'.split(' ').sort(),
      );

      expect(genClass('field_6').split(' ').sort()).toEqual(
        'untested_string'.split(' ').sort(),
      );
    });
  });

  describe('When only some keys are provided', () => {
    const genClass = classnames(res, {
      invalid: 'invalid_string',
    });

    it('should produce a string matching the classnames object for each field', () => {
      expect(genClass('field_1')).toBe('');

      // splitting and sorting to not rely on object order which is unspecified in the language
      expect(genClass('field_2').split(' ').sort()).toEqual(
        'invalid_string'.split(' ').sort(),
      );
      expect(genClass('field_3').split(' ').sort()).toEqual(
        ''.split(' ').sort(),
      );
    });
  });

  describe('pending', () => {
    it('should add the pending classname when a test is pending', () => {
      const suite = vest.create(() => {
        vest.test('field_1', 'msg', async () => {});
        vest.test('field_2', 'msg', () => {});
        vest.test('field_3', 'msg', () => {});
      });

      const res = suite.run();

      const genClass = classnames(res, {
        pending: 'pending_string',
      });
      expect(genClass('field_1')).toBe('pending_string');

      // splitting and sorting to not rely on object order which is unspecified in the language
      expect(genClass('field_2').split(' ').sort()).toEqual(
        ''.split(' ').sort(),
      );
      expect(genClass('field_3').split(' ').sort()).toEqual(
        ''.split(' ').sort(),
      );
    });
  });
});
