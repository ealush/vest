import itWithContext from '../../../../testUtils/itWithContext';
import { dummyTest } from '../../../../testUtils/testDummy';
import { setTestObjects } from '../../../../testUtils/testObjects';

import { produceFullResult } from 'produce';
import { produceDraft } from 'produceDraft';

const methods = {
  produceDraft,
  produceFullResult,
};

describe.each(Object.keys(methods))('produce method: %s', methodName => {
  const produceMethod = methods[methodName];
  describe(`${methodName}->getErrorsByGroup`, () => {
    describe('When no tests', () => {
      describe('When no fieldName passed', () => {
        itWithContext('Should return an empty object', () => {
          expect(produceMethod().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        itWithContext('Should return an empty array', () => {
          expect(
            produceMethod().getErrorsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        itWithContext('Should return an empty object', () => {
          setTestObjects(
            dummyTest.passing('field_1', 'message', 'group_name'),
            dummyTest.passing()
          );
          expect(produceMethod().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(
            dummyTest.passing('field_1', 'message', 'group_name'),
            dummyTest.passing()
          );
          expect(
            produceMethod().getErrorsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        itWithContext(
          'Should return an object containing the error messages of each group',
          () => {
            setTestObjects(
              dummyTest.failing('field_1', 'message_1', 'group_name'),
              dummyTest.failing('field_1', 'message_2'),
              dummyTest.failing('field_2'),
              dummyTest.failing('field_2', 'message_3', 'group_name'),
              dummyTest.failing('field_2', 'message_4', 'group_name'),
              dummyTest.failing('field_2', 'message_4', 'group_name_2'),
              dummyTest.passing('field_1'),
              dummyTest.passing('field_2'),
              dummyTest.passing('field_3')
            );
            expect(produceMethod().getErrorsByGroup('group_name')).toEqual({
              field_1: ['message_1'],
              field_2: ['message_3', 'message_4'],
            });
          }
        );
      });
      describe('When fieldName passed', () => {
        itWithContext(
          "Should return an array of the field's error messages",
          () => {
            setTestObjects(
              dummyTest.failing('field_1', 'message_1', 'group_name'),
              dummyTest.failing('field_1', 'message_2'),
              dummyTest.failing('field_2'),
              dummyTest.failing('field_2', 'message_3', 'group_name'),
              dummyTest.passing('field_1'),
              dummyTest.passing('field_2'),
              dummyTest.passing('field_3')
            );
            expect(
              produceMethod().getErrorsByGroup('group_name', 'field_1')
            ).toEqual(['message_1']);
            expect(
              produceMethod().getErrorsByGroup('group_name', 'field_2')
            ).toEqual(['message_3']);
          }
        );
      });
    });
  });
  describe(`${methodName}->getWarningsByGroup`, () => {
    describe('When no tests', () => {
      describe('When no fieldName passed', () => {
        itWithContext('Should return an empty object', () => {
          expect(produceMethod().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        itWithContext('Should return an empty array', () => {
          expect(
            produceMethod().getWarningsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        itWithContext('Should return an empty object', () => {
          setTestObjects(
            dummyTest.passing('field_1', 'message', 'group_name'),
            dummyTest.passing()
          );
          expect(produceMethod().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        itWithContext('Should return an empty array', () => {
          setTestObjects(
            dummyTest.passing('field_1', 'message', 'group_name'),
            dummyTest.passing()
          );
          expect(
            produceMethod().getWarningsByGroup('group_name', 'field_name')
          ).toEqual([]);
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        itWithContext(
          'Should return an object containing the warning messages of each group',
          () => {
            setTestObjects(
              dummyTest.failingWarning('field_1', 'message_1', 'group_name'),
              dummyTest.failingWarning('field_1', 'message_2'),
              dummyTest.failingWarning('field_2'),
              dummyTest.failingWarning('field_2', 'message_3', 'group_name'),
              dummyTest.failingWarning('field_2', 'message_4', 'group_name'),
              dummyTest.failingWarning('field_2', 'message_4', 'group_name_2'),
              dummyTest.passing('field_1'),
              dummyTest.passing('field_2'),
              dummyTest.passing('field_3')
            );
            expect(produceMethod().getWarningsByGroup('group_name')).toEqual({
              field_1: ['message_1'],
              field_2: ['message_3', 'message_4'],
            });
          }
        );
      });
      describe('When fieldName passed', () => {
        itWithContext(
          "Should return an array of the field's warning messages",
          () => {
            setTestObjects(
              dummyTest.failingWarning('field_1', 'message_1', 'group_name'),
              dummyTest.failingWarning('field_1', 'message_2'),
              dummyTest.failingWarning('field_2'),
              dummyTest.failingWarning('field_2', 'message_3', 'group_name'),
              dummyTest.passing('field_1'),
              dummyTest.passing('field_2'),
              dummyTest.passing('field_3')
            );
            expect(
              produceMethod().getWarningsByGroup('group_name', 'field_1')
            ).toEqual(['message_1']);
            expect(
              produceMethod().getWarningsByGroup('group_name', 'field_2')
            ).toEqual(['message_3']);
          }
        );
      });
    });
  });
});
