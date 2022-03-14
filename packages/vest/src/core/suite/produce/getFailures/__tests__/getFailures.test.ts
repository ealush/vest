/* eslint-disable no-console */
import itWithContext from '../../../../../../testUtils/itWithContext';
import { dummyTest } from '../../../../../../testUtils/testDummy';
import { setTestObjects } from '../../../../../../testUtils/testObjects';

import { produceSuiteResult } from 'produceSuiteResult';
import { produceFullResult } from 'produceSuiteRunResult';

const methods = {
  produceSuiteResult,
  produceFullResult,
};

describe.each(Object.keys(methods))('produce method: %s', methodName => {
  const produceMethod = methods[methodName];

  describe(`${methodName}->getErrors`, () => {
    describe('When no testObjects', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an empty object', () => {
          expect(produceMethod().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          expect(produceMethod().getErrors('field_1')).toEqual([]);
        });
      });
    });
    describe('When no errors', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an empty object', () => {
          setTestObjects(dummyTest.passing(), dummyTest.passing());
          expect(produceMethod().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(dummyTest.passing('field_1'), dummyTest.passing());
          expect(produceMethod().getErrors('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are errors', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an object with an array per field', () => {
          setTestObjects(
            dummyTest.failing('field_1', 'msg_1'),
            dummyTest.failing('field_2', 'msg_2'),
            dummyTest.failing('field_2', 'msg_3'),
            dummyTest.passing('field_1', 'msg_4'),
            dummyTest.failingWarning('field_1', 'msg_5')
          );
          expect(produceMethod().getErrors()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(
            dummyTest.failing('field_1', 'msg_1'),
            dummyTest.failing('field_2', 'msg_2'),
            dummyTest.failing('field_2', 'msg_3'),
            dummyTest.passing('field_1', 'msg_4'),
            dummyTest.failingWarning('field_1', 'msg_5')
          );
          expect(produceMethod().getErrors('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });
  describe(`${methodName}->getError`, () => {
    describe('When no error', () => {
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty string', () => {
          setTestObjects(dummyTest.passing('field_1'), dummyTest.passing());
          expect(produceMethod().getError('field_1')).toBe('');
        });
      });
    });
    describe(`When there's is an error`, () => {
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty string', () => {
          setTestObjects(
            dummyTest.failing('field_1', 'msg_1'),
            dummyTest.passing('field_1', 'msg_4'),
            dummyTest.failingWarning('field_1', 'msg_5')
          );
          expect(produceMethod().getError('field_1')).toBe('msg_1');
        });
      });
    });
  });

  describe(`${methodName}->getWarnings`, () => {
    describe('When no testObjects', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an empty object', () => {
          expect(produceMethod().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          expect(produceMethod().getWarnings('field_1')).toEqual([]);
        });
      });
    });
    describe('When no warnings', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an empty object', () => {
          setTestObjects(dummyTest.passing(), dummyTest.passing());
          expect(produceMethod().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(dummyTest.passing('field_1'), dummyTest.passing());
          expect(produceMethod().getWarnings('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are warnings', () => {
      describe('When no parameters passed', () => {
        itWithContext('Should return an object with an array per field', () => {
          setTestObjects(
            dummyTest.failingWarning('field_1', 'msg_1'),
            dummyTest.failingWarning('field_2', 'msg_2'),
            dummyTest.failingWarning('field_2', 'msg_3'),
            dummyTest.passingWarning('field_1', 'msg_4'),
            dummyTest.failing('field_1', 'msg_5')
          );
          expect(produceMethod().getWarnings()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
        });
      });
      describe('When requesting a fieldName', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(
            dummyTest.failingWarning('field_1', 'msg_1'),
            dummyTest.failingWarning('field_2', 'msg_2'),
            dummyTest.failingWarning('field_2', 'msg_3'),
            dummyTest.passingWarning('field_1', 'msg_4'),
            dummyTest.failing('field_1', 'msg_5')
          );
          expect(produceMethod().getWarnings('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });
});
