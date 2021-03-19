import faker from 'faker';
import { noop } from 'lodash';
import testDummy from '../../../../testUtils/testDummy';

import { dummyTest } from '../../../../testUtils/testDummy';
import vest from 'vest';
import enforce from 'enforce';
import test from 'test';
import group from 'group';
import create from 'createSuite';

beforeEach.ctx = cb => beforeEach(() => context.run({ stateRef }, cb));

describe('Test createSuite module', () => {
  describe('Test suite Arguments', () => {
    it('allows omitting suite name', () => {
      expect(typeof create(Function.prototype)).toBe('function');
      expect(typeof create(Function.prototype).get).toBe('function');
      expect(typeof create(Function.prototype).reset).toBe('function');
      expect(typeof create(Function.prototype).remove).toBe('function');
      expect(create(Function.prototype).get()).toMatchSnapshot();
    });

    it.each([faker.random.word(), null, undefined, 0, 1, true, false, NaN, ''])(
      'Throws an error when `tests` callback is not a function',
      value => {
        expect(() => create(value)).toThrow(
          '[vest]: Suite initialization error. Expected `tests` to be a function.'
        );
        expect(() => create('suite_name', value)).toThrow(
          '[vest]: Suite initialization error. Expected `tests` to be a function.'
        );
      }
    );
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof create('suiteName', noop)).toBe('function');
    });
  });

  describe('When returned function is invoked', () => {
    it('Calls `tests` argument', () =>
      new Promise(done => {
        const validate = create('FormName', done);
        validate();
      }));

    it('Passes all arguments over to tests callback', () => {
      const testsCallback = jest.fn();
      const params = [
        1,
        2,
        3,
        { [faker.random.word()]: [1, 2, 3] },
        false,
        [faker.random.word()],
      ];
      const validate = create('FormName', testsCallback);
      validate(...params);
      expect(testsCallback).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    const testsCb = jest.fn();
    const genValidate = () => create('initial_run_spec', testsCb);

    it('Should initialize with an empty result object', () => {
      const validate = genValidate();
      expect(Object.keys(validate.get().tests)).toHaveLength(0);
      expect(Object.keys(validate.get().groups)).toHaveLength(0);

      expect(validate.get().errorCount).toBe(0);
      expect(validate.get().warnCount).toBe(0);
      expect(validate.get().testCount).toBe(0);

      expect(validate.get()).toMatchSnapshot();
    });

    it('Should be able to get the suite from the result of createSuite', () => {
      const testsCb = jest.fn();
      expect(create('test_get_suite', testsCb).get()).toMatchSnapshot();
    });

    it('Should be able to reset the suite from the result of createSuite', () => {
      const testSuite = create('test_reset_suite', () => {
        dummyTest.failing('f1', 'm1');
      });
      testSuite();
      expect(testSuite.get().hasErrors()).toBe(true);
      expect(testSuite.get().testCount).toBe(1);
      testSuite.reset();
      expect(testSuite.get().hasErrors()).toBe(false);
      expect(testSuite.get().testCount).toBe(0);
    });

    it('Should return without calling tests callback', () => {
      const validate = create(testsCb);
      expect(testsCb).not.toHaveBeenCalled();
      validate();
      expect(testsCb).toHaveBeenCalled();
    });
  });

  describe('Sanity check for Suite methods', () => {
    let testObject;
    const groupName = 'group_name';
    const suite = vest.create(faker.random.word(), () => {
      testObject = test(
        faker.random.word(),
        faker.lorem.sentence(),
        () => false
      );
    });
    const result = suite();
    const fieldName = testObject.fieldName;

    describe("method: hasErrors", () => {
      expect(suite.hasErrors(fieldName)).toBe(true);
      expect(suite.hasErrors(fieldName)).toEqual(result.hasErrors(fieldName));
      expect(suite.hasErrors(fieldName)).toEqual(suite.get().hasErrors(fieldName));
    });
    describe("method: hasWarnings", () => {
      expect(suite.hasWarnings()).toBe(false);
      expect(suite.hasWarnings(fieldName)).toBe(false);
      expect(suite.hasWarnings(fieldName)).toEqual(result.hasWarnings(fieldName));
      expect(suite.hasWarnings(fieldName)).toEqual(suite.get().hasWarnings(fieldName));
    });
    describe("method: getErrors", () => {
      const field = 'field_with_message';
      const message = 'field_with_message';
      const res = create(() => {
        test(field, message, () => enforce().fail());
      })();
      expect(res.getErrors(field)).toEqual([message]);
      expect(suite.getErrors(field)).toEqual(suite.get().getErrors(field));
      expect(suite.getErrors(field)).toEqual(result.getErrors(field));
    });
    describe("meethod: getWarnings", () => {
      const field = 'warning_field_with_message';
      const message = 'some_field_message';
      const res = create(() => {
        test(field, message, () => {
          vest.warn();
          enforce().fail();
        });
      })();
      expect(res.getWarnings(field)).toEqual([message]);
      expect(suite.getWarnings(field)).toEqual(suite.get().getWarnings(field));
      expect(suite.getWarnings(field)).toEqual(result.getWarnings(field));
    });
    describe("method: hasErrorsByGroup", () => {
      let validate, res;
      const validation = () =>
        res = vest.create('suite_name', () => {
          group(groupName, () => {
            testDummy(vest).failing();
          });
        });
      beforeEach(() => {
        validate = validation();
        res = validate();
      });

      it('Should return false', () => {
        expect(res.hasErrorsByGroup()).toBe(false);
        expect(res.hasErrorsByGroup('fake-group')).toBe(false);
      });

      describe('With fieldName', () => {
        const valid = () =>
          vest.create('suite_name', () => {
            testDummy(vest).passing();

            group(groupName, () => {
              testDummy(vest).failing('failing_1');
              testDummy(vest).passing('passing_1');
            });
          });

        beforeEach(() => {
          validate = valid();
          res = validate();
        });

        it('Should return false when field is passing', () => {
          expect(res.hasErrorsByGroup(groupName, 'passing_1')).toBe(false);
        });

        it('Should return true when field is failing', () => {
          expect(res.hasErrorsByGroup(groupName, 'failing_1')).toBe(true);
        });

        it('Should return false when field is not present', () => {
          expect(res.hasErrorsByGroup(groupName, 'I do not Exist')).toBe(false);
        });
      });
    });
    describe("method: getErrorsByGroup", () => {
      let res, validate;

      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).failing('field_1');
          testDummy(vest).passing('field_2');

          group(groupName, () => {
            testDummy(vest).failing('field_1', 'error_1:a');
            testDummy(vest).failing('field_1', 'error_1:b');
            testDummy(vest).failing('field_2', 'error_2');
            testDummy(vest).passing('field_2');
            testDummy(vest).failing('field_3', 'error_3');
            testDummy(vest).failingWarning('field_1');
            testDummy(vest).failingWarning('field_4');
            testDummy(vest).passing('field_5');
          });
        });

      beforeEach(() => {
        validate = validation();
        res = validate();
      });

      const suite = vest.create(faker.random.word(), () => {
        testObject = test(
          faker.random.word(),
          faker.lorem.sentence(),
          () => false
        );
      });
      const result = suite();
      describe('When comparing new vs. old methods', () => {
        it('Should return equal', () => {
          expect(suite.getErrorsByGroup(groupName)).toEqual(result.getErrorsByGroup(groupName));
          expect(suite.getErrorsByGroup(groupName)).toEqual(suite.get().getErrorsByGroup(groupName));
        })
      });

      describe('When no group passed', () => {
        it('Should throw error', () => {
          expect(() => res.getErrorsByGroup()).toThrow(
            '[vest]: getErrorsByGroup requires a group name. Received `undefined` instead.'
          );
        });
      });

      describe('When field name passed', () => {
        it('Should return error array for provided field', () => {
          expect(res.getErrorsByGroup(groupName, 'field_1')).toEqual([
            'error_1:a',
            'error_1:b',
          ]);
          expect(res.getErrorsByGroup(groupName, 'field_2')).toEqual(['error_2']);
          expect(res.getErrorsByGroup(groupName, 'field_3')).toEqual(['error_3']);
          expect(res.getErrorsByGroup(groupName, 'field_4')).toEqual([]);
          expect(res.getErrorsByGroup(groupName, 'field_5')).toEqual([]);
        });
      });

      describe('When field does not exist', () => {
        it('Should return an empty array', () => {
          expect(res.getErrorsByGroup(groupName, 'field_100')).toEqual([]);
        });
      });
    });
    describe("method: hasWarningsByGroup", () => {
      let validate, res;
      const validation = () =>
        vest.create('suite_name', () => {
            group(groupName, () => {
              testDummy(vest).failingWarning();
            });
      });

      beforeEach(() => {
          validate = validation();
          res = validate();
      });

      const suite = vest.create(faker.random.word(), () => {
          testObject = test(
            faker.random.word(),
            faker.lorem.sentence(),
            () => false
          );
      });
      const result = suite();
      it('Should return false', () => {
          expect(res.hasWarningsByGroup()).toBe(false);
      });
      it('Should return false when group does not exist', () => {
          expect(res.hasWarningsByGroup('fake-group')).toBe(false);
      });
      it('Should return as equals', () => {
          expect(suite.hasWarningsByGroup(groupName)).toEqual(result.hasWarningsByGroup(groupName));
          expect(suite.hasWarningsByGroup(groupName)).toEqual(suite.get().hasWarningsByGroup(groupName));
      });
    });
    describe("method: getWarningsByGroup", () => {
      let res, validate;

      const validation = () =>
        vest.create('suite_name', () => {
          testDummy(vest).failingWarning('field_1');
          testDummy(vest).passing('field_2');
  
          group(groupName, () => {
            testDummy(vest).failingWarning('field_1', 'warning_1:a');
            testDummy(vest).failingWarning('field_1', 'warning_1:b');
            testDummy(vest).failingWarning('field_2', 'warning_2');
            testDummy(vest).passing('field_2');
            testDummy(vest).failingWarning('field_3', 'warning_3');
            testDummy(vest).failing('field_1');
            testDummy(vest).failing('field_4');
            testDummy(vest).passing('field_5');
          });
        });
  
      beforeEach(() => {
        validate = validation();
        res = validate();
      });
      describe('When no group passed', () => {
        it('Should throw error', () => {
          expect(() => res.getWarningsByGroup()).toThrow(
            '[vest]: getWarningsByGroup requires a group name. Received `undefined` instead.'
          );
        });
      });
      describe('When field does not exist', () => {
        it('Should return an empty array', () => {
          expect(res.getWarningsByGroup(groupName, 'field_100')).toEqual([]);
        });
      });
      describe('When field name passed', () => {
        it('Should return warning array for provided field', () => {
          expect(res.getWarningsByGroup(groupName, 'field_1')).toEqual([
            'warning_1:a',
            'warning_1:b',
          ]);
          expect(res.getWarningsByGroup(groupName, 'field_2')).toEqual([
            'warning_2',
          ]);
          expect(res.getWarningsByGroup(groupName, 'field_3')).toEqual([
            'warning_3',
          ]);
          expect(res.getWarningsByGroup(groupName, 'field_4')).toEqual([]);
          expect(res.getWarningsByGroup(groupName, 'field_5')).toEqual([]);
        });
      });
      describe('Should return as equal', () => {
        const validation = () =>
          vest.create('suite_name', () => {
            group(groupName, () => {
              testDummy(vest).failingWarning();
            });
          });

        beforeEach(() => {
          validate = validation();
          res = validate();
        });

        const suite = vest.create(faker.random.word(), () => {
          testObject = test(
            faker.random.word(),
            faker.lorem.sentence(),
            () => false
          );
        });
        const result = suite();
        it('Should return as equal', () => {
          expect(suite.getWarningsByGroup(groupName)).toEqual(result.getWarningsByGroup(groupName));
          expect(suite.getWarningsByGroup(groupName)).toEqual(suite.get().getWarningsByGroup(groupName));
        });
      });
    });
  });
});