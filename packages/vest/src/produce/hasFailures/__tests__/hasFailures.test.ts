import faker from 'faker';

import itWithContext from '../../../../testUtils/itWithContext';
import { dummyTest } from '../../../../testUtils/testDummy';
import {
  setTestObjects,
  emptyTestObjects,
} from '../../../../testUtils/testObjects';

import { produceFullResult } from 'produce';
import { produceDraft } from 'produceDraft';

const methods = {
  produceDraft,
  produceFullResult,
};

describe.each(Object.keys(methods))('produce method: %s', methodName => {
  const produceMethod = methods[methodName];

  const fieldName = faker.random.word();

  describe(`${methodName}->hasErrors`, () => {
    describe('When no test objects', () => {
      itWithContext('should return false', () => {
        emptyTestObjects();
        expect(produceMethod().hasErrors(fieldName)).toBe(false);
        expect(produceMethod().hasErrors()).toBe(false);
      });
    });

    describe('When no failing test objects', () => {
      itWithContext('should return false', () => {
        setTestObjects(
          dummyTest.passing(fieldName),
          dummyTest.passing('field_1'),
          dummyTest.passing('field_2')
        );
        expect(produceMethod().hasErrors(fieldName)).toBe(false);
        expect(produceMethod().hasErrors()).toBe(false);
      });
    });

    describe('When failed fields are warning', () => {
      itWithContext('should return false', () => {
        setTestObjects(
          dummyTest.failingWarning(),
          dummyTest.passing(fieldName)
        );
        expect(produceMethod().hasErrors(fieldName)).toBe(false);
        expect(produceMethod().hasErrors()).toBe(false);
      });
    });

    describe('When field has an error', () => {
      itWithContext(
        'Should return true when some of the tests of the field are erroring',
        () => {
          setTestObjects(dummyTest.passing(), dummyTest.failing(fieldName));
          expect(produceMethod().hasErrors(fieldName)).toBe(true);
          expect(produceMethod().hasErrors()).toBe(true);
        }
      );

      itWithContext('should return true', () => {
        setTestObjects(dummyTest.failing(fieldName));
        expect(produceMethod().hasErrors(fieldName)).toBe(true);
        expect(produceMethod().hasErrors()).toBe(true);
      });
    });
  });

  describe(`${methodName}->hasWarnings`, () => {
    describe('When no test objects', () => {
      itWithContext('should return false', () => {
        emptyTestObjects();
        expect(produceMethod().hasWarnings(fieldName)).toBe(false);
        expect(produceMethod().hasWarnings()).toBe(false);
      });
    });

    describe('When no failing test objects', () => {
      itWithContext('should return false', () => {
        setTestObjects(
          dummyTest.passingWarning(fieldName),
          dummyTest.passing('field_1')
        );
        expect(produceMethod().hasWarnings(fieldName)).toBe(false);
        expect(produceMethod().hasWarnings()).toBe(false);
      });
    });

    describe('When failed fields is not warning', () => {
      itWithContext('should return false', () => {
        setTestObjects(dummyTest.failing(fieldName));
        expect(produceMethod().hasWarnings(fieldName)).toBe(false);
        expect(produceMethod().hasWarnings()).toBe(false);
      });
    });

    describe('When field is warning', () => {
      itWithContext(
        'Should return true when some of the tests of the field are warning',
        () => {
          setTestObjects(
            dummyTest.passingWarning(),
            dummyTest.failingWarning(fieldName)
          );
          expect(produceMethod().hasWarnings(fieldName)).toBe(true);
          expect(produceMethod().hasWarnings()).toBe(true);
        }
      );

      itWithContext('should return false', () => {
        setTestObjects(dummyTest.failingWarning(fieldName));
        expect(produceMethod().hasWarnings(fieldName)).toBe(true);
        expect(produceMethod().hasWarnings()).toBe(true);
      });
    });
  });
});
