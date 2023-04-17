import { TTestSuite } from 'testUtils/TVestMock';
import * as vest from 'vest';

describe('summaryFailures', () => {
  let suite: TTestSuite = vest.create(() => {});

  describe('errors', () => {
    beforeEach(() => {
      suite = vest.create(() => {
        vest.test('username', 'username is required', () => false);
        vest.test('password', 'username is required', () => {});
        vest.test('confirm', 'passwords do not match', () => false);
        vest.test('email', 'email was not provided', () => {
          vest.warn();
          return false;
        });
      });

      suite();
    });
    test('Summary has an errors array', () => {
      expect(suite.get().errors).toBeInstanceOf(Array);
    });

    test('errors array only contains failed tests', () => {
      expect(suite.get().errors).toHaveLength(2);
      expect(suite.get().errors.at(0)).toEqual({
        fieldName: 'username',
        message: 'username is required',
        groupName: undefined,
      });
      expect(suite.get().errors.at(1)).toEqual({
        fieldName: 'confirm',
        message: 'passwords do not match',
        groupName: undefined,
      });
    });

    test('Should add errors to the array in the order they were defined', () => {
      suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.test('username', 'uxsername is required', () => false);
        vest.test('confirm', 'passwords do not match', () => false);
        vest.test('username', 'username is too short', () => false);
      });

      suite();

      expect(suite.get().errors).toHaveLength(3);
      expect(suite.get().errors).toEqual([
        {
          fieldName: 'username',
          message: 'uxsername is required',
          groupName: undefined,
        },
        {
          fieldName: 'confirm',
          message: 'passwords do not match',
          groupName: undefined,
        },
        {
          fieldName: 'username',
          message: 'username is too short',
          groupName: undefined,
        },
      ]);
    });

    test('Should add the test group into the error object', () => {
      suite = vest.create(() => {
        vest.group('user', () => {
          vest.test('username', 'uxsername is required', () => false);
          vest.test('username', 'username is too short', () => false);
        });
        vest.test('confirm', 'passwords do not match', () => false);
      });

      suite();

      expect(suite.get().errors).toHaveLength(3);
      expect(suite.get().errors).toEqual([
        {
          fieldName: 'username',
          message: 'uxsername is required',
          groupName: 'user',
        },
        {
          fieldName: 'username',
          message: 'username is too short',
          groupName: 'user',
        },
        {
          fieldName: 'confirm',
          message: 'passwords do not match',
          groupName: undefined,
        },
      ]);
    });
  });

  describe('warnings', () => {
    beforeEach(() => {
      suite = vest.create(() => {
        vest.test('username', 'username is required', () => {
          vest.warn();
          return false;
        });
        vest.test('password', 'username is required', () => {});
        vest.test('confirm', 'passwords do not match', () => {
          vest.warn();
          return false;
        });
        vest.test('email', 'email was not provided', () => false);
      });

      suite();
    });

    test('Summary has a warnings array', () => {
      expect(suite.get().warnings).toBeInstanceOf(Array);
    });

    test('warnings array only contains warning tests', () => {
      expect(suite.get().warnings).toHaveLength(2);
      expect(suite.get().warnings.at(0)).toEqual({
        fieldName: 'username',
        message: 'username is required',
        groupName: undefined,
      });
      expect(suite.get().warnings.at(1)).toEqual({
        fieldName: 'confirm',
        message: 'passwords do not match',
        groupName: undefined,
      });
    });

    test('Should add warnings to the array in the order they were defined', () => {
      suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.test('username', 'uxsername is required', () => {
          vest.warn();
          return false;
        });
        vest.test('confirm', 'passwords do not match', () => {
          vest.warn();
          return false;
        });
        vest.test('username', 'username is too short', () => {
          vest.warn();
          return false;
        });
      });

      suite();

      expect(suite.get().warnings).toHaveLength(3);
      expect(suite.get().warnings).toEqual([
        {
          fieldName: 'username',
          message: 'uxsername is required',
          groupName: undefined,
        },
        {
          fieldName: 'confirm',
          message: 'passwords do not match',
          groupName: undefined,
        },
        {
          fieldName: 'username',
          message: 'username is too short',
          groupName: undefined,
        },
      ]);
    });

    test('Should add the test group into the warning object', () => {
      suite = vest.create(() => {
        vest.group('user', () => {
          vest.test('username', 'uxsername is required', () => {
            vest.warn();
            return false;
          });
          vest.test('username', 'username is too short', () => {
            vest.warn();
            return false;
          });
        });
        vest.test('confirm', 'passwords do not match', () => {
          vest.warn();
          return false;
        });
      });

      suite();

      expect(suite.get().warnings).toHaveLength(3);
      expect(suite.get().warnings).toEqual([
        {
          fieldName: 'username',
          message: 'uxsername is required',
          groupName: 'user',
        },
        {
          fieldName: 'username',
          message: 'username is too short',
          groupName: 'user',
        },
        {
          fieldName: 'confirm',
          message: 'passwords do not match',
          groupName: undefined,
        },
      ]);
    });
  });
});
