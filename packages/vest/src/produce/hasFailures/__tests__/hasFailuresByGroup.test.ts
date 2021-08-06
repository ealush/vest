import faker from 'faker';

import itWithContext from '../../../../testUtils/itWithContext';
import { dummyTest } from '../../../../testUtils/testDummy';
import {
  emptyTestObjects,
  setTestObjects,
} from '../../../../testUtils/testObjects';

import { hasErrorsByGroup, hasWarningsByGroup } from 'hasFailuresByGroup';

const fieldName = faker.random.word();
const groupName = faker.lorem.word();

describe('hasErrorsByGroup', () => {
  describe('When no tests', () => {
    itWithContext('Should return false', () => {
      emptyTestObjects();
      expect(hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.passing());
      expect(hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.failing());
      expect(hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.failing('field_1', 'msg', 'another_group'));
      expect(hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but warning', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.failingWarning('field_1', 'msg', groupName));
      expect(hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    itWithContext('Should return true', () => {
      setTestObjects(dummyTest.failing('field_1', 'msg', groupName));
      expect(hasErrorsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      itWithContext('Should return false', () => {
        setTestObjects(dummyTest.failing('field_1', 'msg', groupName));
        expect(hasErrorsByGroup(groupName, 'non_matcing_field')).toBe(false);
      });
    });

    describe('When matching', () => {
      itWithContext('Should return true', () => {
        setTestObjects(dummyTest.failing(fieldName, 'msg', groupName));
        expect(hasErrorsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});

describe('hasWarningsByGroup', () => {
  describe('When no tests', () => {
    itWithContext('Should return false', () => {
      emptyTestObjects();
      expect(hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.passingWarning(fieldName, 'msg', groupName));
      expect(hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.failingWarning());
      expect(hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    itWithContext('Should return false', () => {
      setTestObjects(
        dummyTest.failingWarning(fieldName, 'msg', 'another_group')
      );
      expect(hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but erroring', () => {
    itWithContext('Should return false', () => {
      setTestObjects(dummyTest.failing('field_1', 'msg', groupName));
      expect(hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    itWithContext('Should return true', () => {
      setTestObjects(dummyTest.failingWarning(fieldName, 'msg', groupName));
      expect(hasWarningsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      itWithContext('Should return false', () => {
        setTestObjects(dummyTest.failingWarning(fieldName, 'msg', groupName));
        expect(hasWarningsByGroup(groupName, 'non_matcing_field')).toBe(false);
      });
    });

    describe('When matching', () => {
      itWithContext('Should return true', () => {
        setTestObjects(dummyTest.failingWarning(fieldName, 'msg', groupName));
        expect(hasWarningsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});
