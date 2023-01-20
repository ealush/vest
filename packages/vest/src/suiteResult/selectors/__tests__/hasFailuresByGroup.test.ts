import { faker } from '@faker-js/faker';

import { dummyTest } from '../../../../testUtils/testDummy';

import * as vest from 'vest';

const fieldName = faker.random.word();
const groupName = faker.lorem.word();

let suite: vest.Suite<(...args: any[]) => void, string>;
describe('hasErrorsByGroup', () => {
  describe('When no tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => undefined);

      expect(suite().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.passing();
      });
      expect(suite().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.failing();
      });
      expect(suite().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failing('field_1', 'msg');
        });
      });

      expect(suite().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but warning', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('Should return true', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failing('field_1', 'msg');
        });
      });
      expect(suite().hasErrorsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      it('Should return false', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failing('field_1', 'msg');
          });
        });
        expect(suite().hasErrorsByGroup(groupName, 'non_matcing_field')).toBe(
          false
        );
      });
    });

    describe('When matching', () => {
      it('Should return true', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failing(fieldName, 'msg');
          });
        });
        expect(suite().hasErrorsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});

describe('hasWarningsByGroup', () => {
  describe('When no tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => undefined);
      expect(suite().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.passingWarning(fieldName, 'msg');
        });
      });
      expect(suite().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.failingWarning();
      });
      expect(suite().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but erroring', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failing('field_1', 'msg');
        });
      });
      expect(suite().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('Should return true', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failingWarning(fieldName, 'msg');
        });
      });
      expect(suite().hasWarningsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      it('Should return false', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failingWarning(fieldName, 'msg');
          });
        });
        expect(suite().hasWarningsByGroup(groupName, 'non_matcing_field')).toBe(
          false
        );
      });
    });

    describe('When matching', () => {
      it('Should return true', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failingWarning(fieldName, 'msg');
          });
        });
        expect(suite().hasWarningsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});
