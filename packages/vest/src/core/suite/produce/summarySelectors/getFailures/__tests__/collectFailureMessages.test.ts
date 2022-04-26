// TODO: Verify this test file is not needed and delete it
import { dummyTest } from '../../../../../../../testUtils/testDummy';

import create from 'create';
import group from 'group';
import { SuiteResult } from 'produceSuiteResult';
import * as vest from 'vest';

describe('collectFailureMessages', () => {
  let suite, res: SuiteResult;

  test('Result has an array of matching error messages', () => {
    const result = res.getErrors();
    expect(result.field_1).toEqual([
      'field_1_failure message 2',
      'field_1_failure message 3',
    ]);
  });

  it('Should return filtered messages by the selected group', () => {
    const result = res.getErrorsByGroup('group_1');

    expect(result).toEqual({
      field_1: [],
      field_2: ['field_2_failure message 1', 'field_2_failure message 3'],
    });
  });

  it('Should return an empty object when no options and no failures', () => {
    expect(res.getErrors('nonexistent_field')).toEqual([]);
  });

  it('Should return an object with an empty array when selected field has no errors', () => {
    expect(res.getErrors('v')).toEqual([]);
  });

  describe('getErrors', () => {
    describe('When no options passed', () => {
      it('should match snapshot', () => {
        expect(res.getErrors()).toMatchSnapshot();
      });
    });

    describe('When specific field requested', () => {
      it('Should match snapshot', () => {
        expect(res.getErrors('field_1')).toMatchSnapshot();
        expect(res.getErrors('field_2')).toMatchSnapshot();
        expect(res.getErrors('field_3')).toMatchSnapshot();
      });
    });
  });

  describe('getWarnings', () => {
    describe('When no options passed', () => {
      it('should match snapshot', () => {
        expect(res.getWarnings()).toMatchSnapshot();
      });
    });

    describe('When specific field requested', () => {
      it('Should match snapshot', () => {
        expect(res.getWarnings('field_1')).toMatchSnapshot();
        expect(res.getWarnings('field_2')).toMatchSnapshot();
        expect(res.getWarnings('field_3')).toMatchSnapshot();
      });
    });
  });

  describe('getErrorsByGroup', () => {
    it('Should match snapshot', () => {
      expect(res.getErrorsByGroup('group_1')).toMatchSnapshot();
    });

    describe('with field name', () => {
      it('Should match snapshot', () => {
        expect(res.getErrorsByGroup('group_1', 'field_1')).toMatchSnapshot();
        expect(res.getErrorsByGroup('group_1', 'field_2')).toMatchSnapshot();
        expect(res.getErrorsByGroup('group_1', 'field_3')).toMatchSnapshot();
      });
    });
  });
  describe('getWarningsByGroup', () => {
    it('Should match snapshot', () => {
      expect(res.getWarningsByGroup('group_1')).toMatchSnapshot();
    });

    describe('with field name', () => {
      it('Should match snapshot', () => {
        expect(res.getWarningsByGroup('group_1', 'field_1')).toMatchSnapshot();
        expect(res.getWarningsByGroup('group_1', 'field_2')).toMatchSnapshot();
        expect(res.getWarningsByGroup('group_1', 'field_3')).toMatchSnapshot();
      });
    });
  });

  beforeEach(() => {
    suite = create(() => {
      dummyTest.passing('field_1', 'field_1_failure message 1');
      dummyTest.failing('field_1', 'field_1_failure message 2');
      dummyTest.failing('field_1', 'field_1_failure message 3');
      group('group_1', () => {
        vest.test('field_1', () => false);
        vest.test('field_3', () => {});
      });
      dummyTest.failing('field_2', 'field_2_failure message 1', 'group_1');
      dummyTest.passingWarning('field_2', 'field_2_warning message 1');
      dummyTest.failingWarning('field_2', 'field_2_warning message 2');
      dummyTest.failingWarning(
        'field_2',
        'field_2_warning message 3',
        'group_1'
      );
      dummyTest.failing('field_2', 'field_2_failure message 3', 'group_1');
      dummyTest.passing('v');

      group('group_2', () => {
        dummyTest.passing('x');
      });
    });
    suite();
    res = suite.get();
  });
});
