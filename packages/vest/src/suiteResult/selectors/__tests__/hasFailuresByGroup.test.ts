import { faker } from '@faker-js/faker';
import { TTestSuite } from '../../../testUtils/TVestMock';
import { describe, it, expect } from 'vitest';

import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from '../../../vest';

const fieldName = faker.lorem.word();
const groupName = faker.lorem.word();

let suite: TTestSuite;
describe('hasErrorsByGroup', () => {
  describe('When no tests', () => {
    it('should return false', () => {
      suite = vest.create(() => undefined);

      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        dummyTest.passing();
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        dummyTest.failing();
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failing('field_1', 'msg');
        });
      });

      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but warning', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('should return true', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failing('field_1', 'msg');
        });
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      it('should return false', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failing('field_1', 'msg');
          });
        });
        expect(
          suite.run().hasErrorsByGroup(groupName, 'non_matching_field'),
        ).toBe(false);
      });
    });

    describe('When matching', () => {
      it('should return true', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failing(fieldName, 'msg');
          });
        });
        expect(suite.run().hasErrorsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});

describe('hasWarningsByGroup', () => {
  describe('When no tests', () => {
    it('should return false', () => {
      suite = vest.create(() => undefined);
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.passingWarning(fieldName, 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        dummyTest.failingWarning();
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but erroring', () => {
    it('should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failing('field_1', 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('should return true', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failingWarning(fieldName, 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(true);
    });
  });

  describe('When fieldName is provided', () => {
    describe('When not matching', () => {
      it('should return false', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failingWarning(fieldName, 'msg');
          });
        });
        expect(
          suite.run().hasWarningsByGroup(groupName, 'non_matching_field'),
        ).toBe(false);
      });
    });

    describe('When matching', () => {
      it('should return true', () => {
        suite = vest.create(() => {
          vest.group(groupName, () => {
            dummyTest.failingWarning(fieldName, 'msg');
          });
        });
        expect(suite.run().hasWarningsByGroup(groupName, fieldName)).toBe(true);
      });
    });
  });
});
