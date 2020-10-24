import vest from '../..';
import { dummyTest } from '../../../testUtils/testDummy';
import classNames from '../classNames';
import promisify from '../promisify';

describe('Utility: classNames', () => {
  describe('When called without a vest result object', () => {
    it('Should throw an error', () => {
      expect(classNames).toThrow();
      expect(() => classNames({})).toThrow();
      expect(() => classNames([])).toThrow();
      expect(() => classNames('invalid')).toThrow();
    });
  });

  describe('When called with a vest result object', () => {
    it('Should return a function', async () => {
      const validate = vest.create('form', () => {});
      expect(typeof classNames(validate())).toBe('function');
      const promisifed = await promisify(
        vest.create('form', Function.prototype)
      )();
      expect(typeof classNames(promisifed)).toBe('function');
    });
  });

  const validate = vest.create('form-name', () => {
    vest.skip('field_1');

    dummyTest.failing('field_1');
    dummyTest.failing('field_2');
    dummyTest.failingWarning('field_2');
    dummyTest.failingWarning('field_3');
    dummyTest.passing('field_4');
    dummyTest.failing('field_5');
  });

  const res = validate();

  describe('when all keys are provided', () => {
    const genClass = classNames(res, {
      invalid: 'invalid_string',
      tested: 'tested_string',
      untested: 'untested_string',
      valid: 'valid_string',
      warning: 'warning_string',
    });

    it('Should produce a string matching the classnames object for each field', () => {
      expect(genClass('field_1')).toBe('untested_string');

      // splitting and sorting to not rely on object order which is unspecified in the language
      expect(genClass('field_2').split(' ').sort()).toEqual(
        'invalid_string tested_string warning_string'.split(' ').sort()
      );
      expect(genClass('field_3').split(' ').sort()).toEqual(
        'tested_string warning_string'.split(' ').sort()
      );
      expect(genClass('field_4').split(' ').sort()).toEqual(
        'tested_string valid_string'.split(' ').sort()
      );

      expect(genClass('field_5').split(' ').sort()).toEqual(
        'tested_string invalid_string'.split(' ').sort()
      );

      expect(genClass('field_6').split(' ').sort()).toEqual(
        'untested_string'.split(' ').sort()
      );
    });
  });

  describe('When only some keys are provided', () => {
    const genClass = classNames(res, {
      invalid: 'invalid_string',
    });

    it('Should produce a string matching the classnames object for each field', () => {
      expect(genClass('field_1')).toBe('');

      // splitting and sorting to not rely on object order which is unspecified in the language
      expect(genClass('field_2').split(' ').sort()).toEqual(
        'invalid_string'.split(' ').sort()
      );
      expect(genClass('field_3').split(' ').sort()).toEqual(
        ''.split(' ').sort()
      );
    });
  });
});
