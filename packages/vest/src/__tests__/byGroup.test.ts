import { faker } from '@faker-js/faker';
import { describe, it, expect, beforeEach } from 'vitest';
import wait from 'wait';

import { Modes } from '../hooks/optional/Modes';
import { TTestSuite } from '../testUtils/TVestMock';
import { dummyTest } from '../testUtils/testDummy';
import { TestPromise } from '../testUtils/testPromise';

import * as vest from 'vest';
import {
  test,
  optional,
  create,
  skipWhen,
  warn,
  skip,
  only,
  group,
} from 'vest';

const fieldName = faker.lorem.word();
const groupName = faker.lorem.word();

let suite: TTestSuite;

describe('hasErrorsByGroup', () => {
  describe('When no tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => undefined);

      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.passing();
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.failing();
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failing('field_1', 'msg');
        });
      });

      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but warning', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite.run().hasErrorsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('Should return true', () => {
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
      it('Should return false', () => {
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
      it('Should return true', () => {
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
    it('Should return false', () => {
      suite = vest.create(() => undefined);
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When no failing tests', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.passingWarning(fieldName, 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When there are failing tests without a group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        dummyTest.failingWarning();
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from a different group', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group('another_group', () => {
          dummyTest.failingWarning('field_1', 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group but erroring', () => {
    it('Should return false', () => {
      suite = vest.create(() => {
        vest.group(groupName, () => {
          dummyTest.failing('field_1', 'msg');
        });
      });
      expect(suite.run().hasWarningsByGroup(groupName)).toBe(false);
    });
  });

  describe('When failing tests are from the same group', () => {
    it('Should return true', () => {
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
      it('Should return false', () => {
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
      it('Should return true', () => {
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

const modes = ['SuiteRunResult', 'SuiteResult'];

describe.each(modes)('produce method: %s', mode => {
  let suite: TTestSuite;

  function getRes(...args: any[]) {
    const res = suite.run(...args);
    return mode === 'SuiteRunResult' ? res : suite.get();
  }

  describe(`${mode}->getErrorsByGroup`, () => {
    describe('When no tests', () => {
      beforeEach(() => {
        suite = create(() => {});
      });
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          expect(getRes().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          expect(getRes().getErrorsByGroup('group_name', 'field_name')).toEqual(
            [],
          );
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            vest.group('group_name', () => {
              dummyTest.passing('field_1', 'message');
            });
            dummyTest.passing('f2');
          });
          expect(getRes().getErrorsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            vest.group('group_name', () => {
              dummyTest.passing('field_1', 'message');
            });

            dummyTest.passing();
          });
          expect(getRes().getErrorsByGroup('group_name', 'field_name')).toEqual(
            [],
          );
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object containing the error messages of each group', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            dummyTest.failing('field_1', 'message_2');
            dummyTest.failing('field_2');
            vest.group('group_name', () => {
              dummyTest.failing('field_1', 'message_1');
              dummyTest.failing('field_2', 'message_3');
              dummyTest.failing('field_2', 'message_4');
            });
            dummyTest.passing('field_1', 'message');
            vest.group('group_name_2', () => {
              dummyTest.failing('field_2', 'message_4');
            });
            dummyTest.passing('field_1');
            dummyTest.passing('field_2');
            dummyTest.passing('field_3');
          });
          expect(getRes().getErrorsByGroup('group_name')).toEqual({
            field_1: ['message_1'],
            field_2: ['message_3', 'message_4'],
          });
        });
      });
      describe('When fieldName passed', () => {
        it("Should return an array of the field's error messages", () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            group('group_name', () => {
              vest.test('field_1', 'message_1', () => false);
              vest.test('field_2', 'message_3', () => false);
            });
            vest.test('field_1', 'message_2', () => false);
            vest.test('field_2', () => false);
            vest.test('field_1', () => {});
            vest.test('field_2', () => {});
            vest.test('field_3', () => {});
          });
          expect(getRes().getErrorsByGroup('group_name', 'field_1')).toEqual([
            'message_1',
          ]);
          expect(getRes().getErrorsByGroup('group_name', 'field_2')).toEqual([
            'message_3',
          ]);
        });
      });
    });
  });
  describe(`${mode}->getWarningsByGroup`, () => {
    describe('When no tests', () => {
      beforeEach(() => {
        suite = create(() => {});
      });
      describe('When no fieldName passed', () => {
        it('Should return an object with empty message arrays', () => {
          expect(getRes().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          expect(
            getRes().getWarningsByGroup('group_name', 'field_name'),
          ).toEqual([]);
        });
      });
    });

    describe('When no failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object with no message arrays', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);

            vest.group('group_name', () => {
              dummyTest.passing('field_1', 'message');
            });
            dummyTest.passing();
          });
          expect(getRes().getWarningsByGroup('group_name')).toEqual({});
        });
      });
      describe('When fieldName passed', () => {
        it('Should return an empty array', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            vest.group('group_name', () => {
              dummyTest.passing('field_1', 'message');
            });
            dummyTest.passing();
          });
          expect(
            getRes().getWarningsByGroup('group_name', 'field_name'),
          ).toEqual([]);
        });
      });
    });

    describe('When there are failures', () => {
      describe('When no fieldName passed', () => {
        it('Should return an object containing the warning messages of each group', () => {
          suite = create(() => {
            vest.mode(Modes.ALL);

            vest.group('group_name', () => {
              dummyTest.failingWarning('field_1', 'message_1');
              dummyTest.failingWarning('field_2', 'message_3');
              dummyTest.failingWarning('field_2', 'message_4');
            });
            dummyTest.failingWarning('field_1', 'message_2');
            dummyTest.failingWarning('field_2');

            group('group_name_2', () => {
              dummyTest.failingWarning('field_2', 'message_4');
            });
            dummyTest.passing('field_1');
            dummyTest.passing('field_2');
            dummyTest.passing('field_3');
          });
          expect(getRes().getWarningsByGroup('group_name')).toEqual({
            field_1: ['message_1'],
            field_2: ['message_3', 'message_4'],
          });
        });
      });
      describe('When fieldName passed', () => {
        it("Should return an array of the field's warning messages", () => {
          suite = create(() => {
            vest.mode(Modes.ALL);
            group('group_name', () => {
              vest.test('field_1', 'message_1', () => {
                vest.warn();
                return false;
              });
              vest.test('field_2', 'message_3', () => {
                vest.warn();
                return false;
              });
            });
            vest.test('field_1', 'message_2', () => {
              vest.warn();
              return false;
            });
            vest.test('field_2', () => {
              vest.warn();
              return false;
            });
            vest.test('field_1', () => {});
            vest.test('field_2', () => {});
            vest.test('field_3', () => {});
          });
          expect(getRes().getWarningsByGroup('group_name', 'field_1')).toEqual([
            'message_1',
          ]);
          expect(getRes().getWarningsByGroup('group_name', 'field_2')).toEqual([
            'message_3',
          ]);
        });
      });
    });
  });
});

const GROUP_NAME = 'group_1';

describe('isValidByGroup', () => {
  describe('Before any test ran', () => {
    it('Should return true (vacuously valid)', () => {
      const suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {});
        });
      });

      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
    });
  });

  describe('When there are errors in the group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((fieldToSkip: string) => {
        skip(fieldToSkip);
        optional('field_1');

        group(GROUP_NAME, () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('sanity', () => true);
        });
      });
    });

    it('Should return false when an optional test has errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        false,
      );
    });
    it('Should return false when a required test has errors', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('Should return false when the queried field is not optional and has errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('Should return true when the queried field is optional and has errors', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        true,
      );
    });
  });

  describe('When there are warnings in the group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {
            warn();
            return false;
          });
        });
      });
    });
    it('Should return true when a required test has warnings', () => {
      expect(suite.run().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
    });

    describe('When some of the tests for the required field are warnings', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => {
            warn();
            return false;
          });
          test('field_1', () => true);
        });
      });
      it('Should return true when a required test has warnings', () => {
        expect(suite.run().isValid()).toBe(true);
      });
    });

    describe('when a warning test in a required field is skipped', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => true);

          skipWhen(true, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        });
      });
      it('Should return false even when the skipped field is warning', () => {
        expect(suite.run().isValid()).toBe(false);
      });
    });
  });

  describe('When a non optional field is skipped', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(fieldToSkip => {
        skip(fieldToSkip);
        group(GROUP_NAME, () => {
          test('field_1', () => {
            return false;
          });
          test('field_2', () => {
            return true;
          });
          test('field_3', () => {
            return true;
          });
        });
      });
    });
    it('Should return false', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
    });
    it('Should return false', () => {
      expect(suite.run(['field_2', 'field_3']).isValidByGroup(GROUP_NAME)).toBe(
        false,
      );
    });
  });

  describe('When the suite has an async optional test', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        optional('field_1');

        group(GROUP_NAME, () => {
          test('field_1', async () => {
            await wait(300);
          });
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return false', () => {
        suite.run();
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });
    describe('When test is passing', () => {
      it('Should return true', async () => {
        suite.run();
        await wait(300);
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      });
    });
  });

  describe('When the suite has warning async tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', async () => {
            warn();
            await wait(300);
          });

          test('field_1', () => {
            return true;
          });
        });
      });
    });

    it('Should return false as long as the test is pending', async () => {
      suite.run();
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
    });

    it('Should return false as long as the test is pending when querying a specific field', async () => {
      suite.run();
      expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
    });
  });

  describe('When the suite has async non-optional tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(currentField => {
        only(currentField);
        optional('field_2');
        group(GROUP_NAME, () => {
          test('field_1', async () => {
            await wait(300);
          });
          test('field_2', () => {
            return true;
          });
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return `false` for a required field', () => {
        const result = suite.run();

        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('Should return `true`', async () => {
        const result = await suite.run();
        expect(result.isValidByGroup(GROUP_NAME)).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      });
    });

    describe('When test is lagging', () => {
      it('Should return `false`', async () => {
        suite.run();
        const result = suite.run('field_2');

        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);

        await result;
      });
    });
  });

  describe('When a all required fields are passing', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {
            return true;
          });
          test('field_1', () => {
            return true;
          });
          test('field_2', () => {
            return true;
          });
          test('field_3', () => {
            return true;
          });
        });
      });
    });
    it('Should return true', () => {
      expect(suite.run().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_3')).toBe(true);
    });
  });

  describe('When a required field has some passing tests', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => true);
            skipWhen(true, () => {
              test('field_1', () => {
                return true;
              });
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME),
      ).toBe(false);
    });
  });

  describe('When field name is specified', () => {
    it('Should return false when field did not run yet', () => {
      expect(
        create(() => {
          skip('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('Should return false when testing for a field that does not exist', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field 2'),
      ).toBe(false);
    });

    it("Should return false when some of the field's tests ran", () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {
              return true;
            });
            skipWhen(true, () => {
              test('field_1', () => {
                return true;
              });
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('Should return false when the field has errors', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('Should return true when all the tests are passing', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });

    it('Should return true when the field only has warnings', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });

    it('Should return true if field is optional and did not run', () => {
      expect(
        create(() => {
          optional('field_1');
          skipWhen(true, () => {
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });
  });

  describe('When querying a non existing field', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_2'),
      ).toBe(false);
    });
  });

  describe('When querying a non existing group', () => {
    const suite = create(() => {
      group(GROUP_NAME, () => {
        test('field_1', () => true);
      });
    });
    it('Should return true (vacuously valid)', () => {
      expect(suite.run().isValidByGroup('does-not-exist')).toBe(true);
      expect(suite.run().isValidByGroup('does-not-exist', 'field_1')).toBe(
        true,
      );
    });
  });

  describe('When queried field is omitted', () => {
    it('Should return true', () => {
      expect(
        create(() => {
          optional({
            field_1: () => true,
          });
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME),
      ).toBe(true);
    });
  });

  describe('When querying a field that is in a different group', () => {
    const suite = create(() => {
      group('group_1', () => {
        test('field_1', () => {});
      });
      group('group_2', () => {
        test('field_2', () => {});
      });
    });

    it('Should return false', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_2')).toBe(false);
      expect(suite.run().isValidByGroup('group_2', 'field_1')).toBe(false);
    });
  });

  describe('When querying a field that is outside of a group', () => {
    const suite = create(() => {
      test('field_1', () => {});
      group('group_1', () => {
        test('field_2', () => {});
      });
    });

    it('Should return false', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_1')).toBe(false);
    });
  });

  describe('When the field exists both inside and outside of the group', () => {
    const suite = create(() => {
      vest.mode(Modes.ALL);
      test('field_1', () => false);
      group('group_1', () => {
        test('field_1', () => {});
      });
    });

    it('Should return the result of what is inside the group', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_1')).toBe(true);
    });
  });
});

// ============= Additional Edge Cases =============

describe('Edge cases for byGroup selectors', () => {
  describe('Multiple groups with the same field names', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('group_1', () => {
          test('field_1', 'error in g1', () => false);
          test('field_2', () => {});
        });
        group('group_2', () => {
          test('field_1', () => {});
          test('field_2', 'error in g2', () => false);
        });
      });
    });

    it('hasErrorsByGroup should isolate errors by group', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group_1')).toBe(true);
      expect(result.hasErrorsByGroup('group_1', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('group_1', 'field_2')).toBe(false);
      expect(result.hasErrorsByGroup('group_2')).toBe(true);
      expect(result.hasErrorsByGroup('group_2', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('group_2', 'field_2')).toBe(true);
    });

    it('getErrorsByGroup should isolate errors by group', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('group_1')).toEqual({
        field_1: ['error in g1'],
      });
      expect(result.getErrorsByGroup('group_2')).toEqual({
        field_2: ['error in g2'],
      });
      expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
        'error in g1',
      ]);
      expect(result.getErrorsByGroup('group_2', 'field_2')).toEqual([
        'error in g2',
      ]);
    });

    it('isValidByGroup should isolate validity by group', () => {
      const result = suite.run();
      expect(result.isValidByGroup('group_1')).toBe(false);
      expect(result.isValidByGroup('group_2')).toBe(false);
      expect(result.isValidByGroup('group_1', 'field_1')).toBe(false);
      expect(result.isValidByGroup('group_1', 'field_2')).toBe(true);
      expect(result.isValidByGroup('group_2', 'field_1')).toBe(true);
      expect(result.isValidByGroup('group_2', 'field_2')).toBe(false);
    });
  });

  describe('Nested groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('outer', () => {
          test('field_1', 'outer error', () => false);
          group('inner', () => {
            test('field_2', 'inner error', () => false);
          });
        });
      });
    });

    it('Should handle nested groups correctly', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('outer')).toBe(true);
      expect(result.hasErrorsByGroup('inner')).toBe(true);
      expect(result.getErrorsByGroup('outer', 'field_1')).toEqual([
        'outer error',
      ]);
      expect(result.getErrorsByGroup('inner', 'field_2')).toEqual([
        'inner error',
      ]);
    });
  });

  describe('Mixed errors and warnings in same group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('mixed_group', () => {
          test('field_1', 'error_msg', () => false);
          test('field_2', 'warning_msg', () => {
            warn();
            return false;
          });
          test('field_3', () => {});
        });
      });
    });

    it('Should correctly separate errors and warnings', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('mixed_group')).toBe(true);
      expect(result.hasWarningsByGroup('mixed_group')).toBe(true);
      expect(result.hasErrorsByGroup('mixed_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('mixed_group', 'field_2')).toBe(false);
      expect(result.hasWarningsByGroup('mixed_group', 'field_1')).toBe(false);
      expect(result.hasWarningsByGroup('mixed_group', 'field_2')).toBe(true);
    });

    it('Should get errors and warnings separately', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('mixed_group')).toEqual({
        field_1: ['error_msg'],
      });
      expect(result.getWarningsByGroup('mixed_group')).toEqual({
        field_2: ['warning_msg'],
      });
      expect(result.getErrorsByGroup('mixed_group', 'field_1')).toEqual([
        'error_msg',
      ]);
      expect(result.getWarningsByGroup('mixed_group', 'field_2')).toEqual([
        'warning_msg',
      ]);
    });
  });

  describe('Multiple tests for the same field in a group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('group_1', () => {
          test('field_1', 'error 1', () => false);
          test('field_1', 'error 2', () => false);
          test('field_1', 'error 3', () => false);
        });
      });
    });

    it('Should collect all errors for the same field', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group_1', 'field_1')).toBe(true);
      expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
        'error 1',
        'error 2',
        'error 3',
      ]);
    });

    describe('With mixed results', () => {
      beforeEach(() => {
        suite = create(() => {
          vest.mode(Modes.ALL);
          group('group_1', () => {
            test('field_1', 'error 1', () => false);
            test('field_1', () => {});
            test('field_1', 'error 2', () => false);
          });
        });
      });

      it('Should only collect failing tests', () => {
        const result = suite.run();
        expect(result.getErrorsByGroup('group_1', 'field_1')).toEqual([
          'error 1',
          'error 2',
        ]);
      });
    });
  });

  describe('Empty group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('empty_group', () => {
          // no tests
        });
        group('another_group', () => {
          test('field_1', () => false);
        });
      });
    });

    it('Should handle empty groups', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('empty_group')).toBe(false);
      expect(result.hasWarningsByGroup('empty_group')).toBe(false);
      expect(result.getErrorsByGroup('empty_group')).toEqual({});
      expect(result.getWarningsByGroup('empty_group')).toEqual({});
      expect(result.isValidByGroup('empty_group')).toBe(true);
    });
  });

  describe('Async tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('async_group', () => {
          test('field_1', async () => {
            await wait(100);
            return false;
          });
          test('field_2', async () => {
            warn();
            await wait(100);
            return false;
          });
          test('field_3', async () => {
            await wait(100);
          });
        });
      });
    });

    it('Should return false for validity while tests are pending', () => {
      const result = suite.run();
      expect(result.isValidByGroup('async_group')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_1')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_2')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_3')).toBe(false);
    });

    it('Should return correct results after async tests complete', async () => {
      const result = await suite.run();
      expect(result.hasErrorsByGroup('async_group')).toBe(true);
      expect(result.hasWarningsByGroup('async_group')).toBe(true);
      expect(result.hasErrorsByGroup('async_group', 'field_1')).toBe(true);
      expect(result.hasWarningsByGroup('async_group', 'field_2')).toBe(true);
      expect(result.getErrorsByGroup('async_group', 'field_1')).toHaveLength(1);
      expect(result.getWarningsByGroup('async_group', 'field_2')).toHaveLength(
        1,
      );
      expect(result.isValidByGroup('async_group')).toBe(false);
      expect(result.isValidByGroup('async_group', 'field_3')).toBe(true);
    });
  });

  describe('Skipped tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((skipField: string) => {
        skip(skipField);
        group('skip_group', () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('field_3', () => {});
        });
      });
    });

    it('Should not consider skipped tests in hasErrorsByGroup', () => {
      const result = suite.run('field_1');
      expect(result.hasErrorsByGroup('skip_group')).toBe(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
    });

    it('Should not include skipped tests in getErrorsByGroup', () => {
      const result = suite.run('field_1');
      const errors = result.getErrorsByGroup('skip_group');
      expect(errors).not.toHaveProperty('field_1');
      expect(errors).toHaveProperty('field_2');
    });

    it('Should consider skipped tests when checking validity', () => {
      const result = suite.run('field_1');
      expect(result.isValidByGroup('skip_group')).toBe(false);
      expect(result.isValidByGroup('skip_group', 'field_1')).toBe(false);
    });
  });

  describe('Optional tests in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        optional({ field_1: false, field_2: false });
        group('optional_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'error 2', () => false);
        });
      });
    });

    it('Should detect errors when optional is not applied', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('optional_group')).toBe(true);
      expect(result.hasErrorsByGroup('optional_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('optional_group', 'field_2')).toBe(true);
      expect(result.getErrorsByGroup('optional_group', 'field_1')).toEqual([
        'error 1',
      ]);
    });

    it('Should fail group validity when optional is not applied', () => {
      const result = suite.run();
      expect(result.isValidByGroup('optional_group')).toBe(false);
      expect(result.isValidByGroup('optional_group', 'field_1')).toBe(false);
      expect(result.isValidByGroup('optional_group', 'field_2')).toBe(false);
    });
  });

  describe('Only mode with groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((onlyField: string) => {
        only(onlyField);
        group('only_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'error 2', () => false);
          test('field_3', () => {});
        });
      });
    });

    it('Should only run the specified field in the group', () => {
      const result = suite.run('field_1');
      expect(result.hasErrorsByGroup('only_group')).toBe(true);
      expect(result.hasErrorsByGroup('only_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('only_group', 'field_2')).toBe(false);
      const errors = result.getErrorsByGroup('only_group');
      expect(errors).toHaveProperty('field_1');
      expect(errors).not.toHaveProperty('field_2');
    });
  });

  describe('Tests without messages in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('no_message_group', () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('field_3', 'has message', () => false);
        });
      });
    });

    it('Should detect errors even without messages', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('no_message_group')).toBe(true);
      expect(result.hasErrorsByGroup('no_message_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('no_message_group', 'field_2')).toBe(true);
    });

    it('Should return empty arrays for fields without messages', () => {
      const result = suite.run();
      expect(result.getErrorsByGroup('no_message_group', 'field_1')).toEqual(
        [],
      );
      expect(result.getErrorsByGroup('no_message_group', 'field_2')).toEqual(
        [],
      );
      expect(result.getErrorsByGroup('no_message_group', 'field_3')).toEqual([
        'has message',
      ]);
    });
  });

  describe('OmitWhen in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((shouldOmit: boolean) => {
        group('omit_group', () => {
          vest.omitWhen(shouldOmit, () => {
            test('field_1', 'omitted error', () => false);
          });
          test('field_2', 'regular error', () => false);
        });
      });
    });

    it('Should omit tests when condition is true', () => {
      const result = suite.run(true);
      expect(result.hasErrorsByGroup('omit_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('omit_group', 'field_2')).toBe(true);
      expect(result.isValidByGroup('omit_group', 'field_1')).toBe(true);
    });

    it('Should include tests when condition is false', () => {
      const result = suite.run(false);
      expect(result.hasErrorsByGroup('omit_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('omit_group', 'field_2')).toBe(true);
    });
  });

  describe('SkipWhen in groups', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((shouldSkip: boolean) => {
        group('skip_group', () => {
          vest.skipWhen(shouldSkip, () => {
            test('field_1', 'skipped error', () => false);
          });
          test('field_2', 'regular error', () => false);
        });
      });
    });

    it('Should skip tests when condition is true', () => {
      const result = suite.run(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
      expect(result.isValidByGroup('skip_group', 'field_1')).toBe(false);
    });

    it('Should run tests when condition is false', () => {
      const result = suite.run(false);
      expect(result.hasErrorsByGroup('skip_group', 'field_1')).toBe(true);
      expect(result.hasErrorsByGroup('skip_group', 'field_2')).toBe(true);
    });
  });

  describe('SuiteResult vs SuiteRunResult consistency', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('consistency_group', () => {
          test('field_1', 'error 1', () => false);
          test('field_2', 'warning 1', () => {
            warn();
            return false;
          });
        });
      });
    });

    it('Should have consistent results between run result and get()', () => {
      const runResult = suite.run();
      const getResult = suite.get();

      expect(runResult.hasErrorsByGroup('consistency_group')).toBe(
        getResult.hasErrorsByGroup('consistency_group'),
      );
      expect(runResult.hasWarningsByGroup('consistency_group')).toBe(
        getResult.hasWarningsByGroup('consistency_group'),
      );
      expect(runResult.getErrorsByGroup('consistency_group')).toEqual(
        getResult.getErrorsByGroup('consistency_group'),
      );
      expect(runResult.getWarningsByGroup('consistency_group')).toEqual(
        getResult.getWarningsByGroup('consistency_group'),
      );
      expect(runResult.isValidByGroup('consistency_group')).toBe(
        getResult.isValidByGroup('consistency_group'),
      );
    });
  });

  describe('Special characters in group and field names', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('group-with-dashes', () => {
          test('field.with.dots', 'error 1', () => false);
          test('field_with_underscores', () => {});
        });
        group('group with spaces', () => {
          test('field-1', 'error 2', () => false);
        });
      });
    });

    it('Should handle special characters in names', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('group-with-dashes')).toBe(true);
      expect(
        result.hasErrorsByGroup('group-with-dashes', 'field.with.dots'),
      ).toBe(true);
      expect(result.hasErrorsByGroup('group with spaces')).toBe(true);
      expect(result.hasErrorsByGroup('group with spaces', 'field-1')).toBe(
        true,
      );
    });
  });

  describe('Large number of fields in a group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        vest.mode(Modes.ALL);
        group('large_group', () => {
          for (let i = 0; i < 100; i++) {
            test(`field_${i}`, `error ${i}`, () => i % 2 === 0);
          }
        });
      });
    });

    it('Should handle large number of fields', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('large_group')).toBe(true);
      const errors = result.getErrorsByGroup('large_group');
      expect(Object.keys(errors).length).toBe(50);
      expect(result.hasErrorsByGroup('large_group', 'field_0')).toBe(false);
      expect(result.hasErrorsByGroup('large_group', 'field_1')).toBe(true);
      expect(result.getErrorsByGroup('large_group', 'field_1')).toEqual([
        'error 1',
      ]);
    });
  });

  describe('Group with all passing tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('passing_group', () => {
          test('field_1', () => {});
          test('field_2', () => true);
          test('field_3', () => {});
        });
      });
    });

    it('Should return valid for group with all passing tests', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('passing_group')).toBe(false);
      expect(result.hasWarningsByGroup('passing_group')).toBe(false);
      expect(result.getErrorsByGroup('passing_group')).toEqual({});
      expect(result.getWarningsByGroup('passing_group')).toEqual({});
      expect(result.isValidByGroup('passing_group')).toBe(true);
    });
  });

  describe('Mixed synchronous and asynchronous tests in group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group('mixed_async_group', () => {
          test('sync_field', 'sync error', () => false);
          test('async_field', async () => {
            await wait(100);
            return false;
          });
        });
      });
    });

    it('Should immediately show sync errors', () => {
      const result = suite.run();
      expect(result.hasErrorsByGroup('mixed_async_group', 'sync_field')).toBe(
        true,
      );
      expect(result.hasErrorsByGroup('mixed_async_group', 'async_field')).toBe(
        false,
      );
    });

    it('Should show async errors after completion', async () => {
      suite.run();
      await wait(150);
      const result = suite.get();
      expect(result.hasErrorsByGroup('mixed_async_group', 'sync_field')).toBe(
        true,
      );
      expect(result.hasErrorsByGroup('mixed_async_group', 'async_field')).toBe(
        true,
      );
    });
  });
});

/*
 * ============================================================================
 * IMPLEMENTATION NOTES AND DESIGN DOCUMENTATION
 * ============================================================================
 *
 * This comprehensive documentation details the internal implementation of the
 * byGroup selector functions in Vest. These notes are based on deep analysis
 * of the codebase and are intended to provide complete understanding of how
 * these features work under the hood.
 *
 * ## OVERVIEW
 *
 * The byGroup selectors are a family of functions that allow querying
 * validation results at the group level. They mirror the non-group selectors
 * (hasErrors, hasWarnings, getErrors, getWarnings, isValid) but operate on
 * the subset of tests within a named group.
 *
 * The five byGroup selector functions are:
 * - hasErrorsByGroup(groupName, fieldName?)
 * - hasWarningsByGroup(groupName, fieldName?)
 * - getErrorsByGroup(groupName, fieldName?)
 * - getWarningsByGroup(groupName, fieldName?)
 * - isValidByGroup(groupName, fieldName?)
 *
 * ## ARCHITECTURE
 *
 * ### Core Files and Modules
 *
 * 1. **suiteSelectors.ts** - The main selector factory
 *    - Location: packages/vest/src/suiteResult/selectors/suiteSelectors.ts
 *    - Exports the `suiteSelectors()` factory function that creates all selectors
 *    - Exports the `SuiteSelectors` interface defining the API contract
 *    - Exports `bindSuiteSelectors()` for binding selectors to a getter function
 *
 * 2. **SuiteResultTypes.ts** - Type definitions
 *    - Location: packages/vest/src/suiteResult/SuiteResultTypes.ts
 *    - Defines the structure of SuiteSummary, which contains:
 *      - tests: Tests<F> - Top-level test results by field name
 *      - groups: Groups<G, F> - Grouped test results
 *    - Groups<G, F> = Record<G, Group<F>>
 *    - Group<F> = Record<F, GroupTestSummary>
 *    - GroupTestSummary contains: errorCount, warnCount, testCount, pendingCount,
 *      errors[], warnings[], valid
 *
 * 3. **collectFailures.ts** - Failure collection utilities
 *    - Location: packages/vest/src/suiteResult/selectors/collectFailures.ts
 *    - Exports `gatherFailures()` - The core function for extracting failure messages
 *    - Handles both single field queries and all-field queries
 *    - Returns either string[] (for specific field) or FailureMessages object
 *
 * 4. **Severity.ts** - Severity enums and utilities
 *    - Location: packages/vest/src/suiteResult/Severity.ts
 *    - Defines Severity enum: ERRORS = 'errors', WARNINGS = 'warnings'
 *    - Defines SeverityCount enum: ERROR_COUNT, WARN_COUNT
 *    - Exports `countKeyBySeverity()` to map severity to count key
 *
 * 5. **useProduceSuiteSummary.ts** - Summary generation
 *    - Location: packages/vest/src/suiteResult/selectors/useProduceSuiteSummary.ts
 *    - Generates the SuiteSummary by walking all test isolates
 *    - Calls `useAppendToGroup()` which populates summary.groups
 *    - Each test with a groupName is added to groups[groupName][fieldName]
 *
 * 6. **shouldAddValidProperty.ts** - Validity computation
 *    - Location: packages/vest/src/suiteResult/selectors/shouldAddValidProperty.ts
 *    - Exports `useShouldAddValidPropertyInGroup()` for group-level validity
 *    - Checks: no errors, no non-optional incomplete tests, no missing tests
 *
 * 7. **hasFailuresByTestObjects.ts** - Test object queries
 *    - Location: packages/vest/src/suiteResult/selectors/hasFailuresByTestObjects.ts
 *    - Exports `hasGroupFailuresByTestObjects()` for querying test objects
 *    - Uses TestWalker.someTests() to check if any test in group has failures
 *    - Used during suite execution for real-time state
 *
 * ## DATA FLOW
 *
 * ### 1. Suite Execution Phase
 *
 * When a suite runs:
 * a) Tests are created as TIsolateTest objects with data:
 *    - fieldName: The field being tested
 *    - groupName: Optional group name (set by group() wrapper)
 *    - message: Optional error message
 *    - severity: TestSeverity.Error or TestSeverity.Warning
 *    - status: TestStatus (PASSING, FAILED, WARNING, etc.)
 *
 * b) The `group()` function (packages/vest/src/isolates/group.ts):
 *    - Creates a Group isolate using Isolate.create()
 *    - Runs the callback within SuiteContext with groupName set
 *    - All tests within the callback inherit this groupName
 *
 * c) Test results are accumulated in the runtime state
 *
 * ### 2. Summary Generation Phase
 *
 * When results are requested (via suite() or suite.get()):
 * a) `useProduceSuiteSummary()` walks all test isolates using TestWalker.reduceTests()
 *
 * b) For each test:
 *    - Appends to summary.tests[fieldName] (top-level stats)
 *    - If test has groupName, calls useAppendToGroup():
 *      - Creates groups[groupName] object if not exists
 *      - Creates groups[groupName][fieldName] object if not exists
 *      - Calls appendTestObject() to update stats (errorCount, warnCount, etc.)
 *      - Adds error/warning messages to groups[groupName][fieldName].errors/warnings
 *      - Computes valid property using useShouldAddValidPropertyInGroup()
 *
 * c) If test is failing or warning, creates SummaryFailure object:
 *    - Contains: fieldName, message, groupName
 *    - Added to summary.errors[] or summary.warnings[] arrays
 *
 * d) Returns complete SuiteSummary with populated groups object
 *
 * ### 3. Selector Invocation Phase
 *
 * When user calls a byGroup selector:
 * a) The selector function receives the pre-computed SuiteSummary
 *
 * b) For hasErrorsByGroup/hasWarningsByGroup:
 *    - Calls hasFailuresByGroup(summary, severityCount, groupName, fieldName)
 *    - Gets groups[groupName] from summary
 *    - Returns false if group doesn't exist
 *    - If fieldName provided: checks if groups[groupName][fieldName][severityCount] > 0
 *    - If no fieldName: iterates all fields in group, returns true if any has count > 0
 *
 * c) For getErrorsByGroup/getWarningsByGroup:
 *    - Calls getFailuresByGroup(summary, severity, groupName, fieldName)
 *    - Passes groups[groupName] to gatherFailures()
 *    - If fieldName provided: returns groups[groupName][fieldName][severity] || []
 *    - If no fieldName: collects all fields with failures into FailureMessages object
 *
 * d) For isValidByGroup:
 *    - Gets groups[groupName] from summary
 *    - Returns false if group doesn't exist
 *    - If fieldName provided: returns groups[groupName][fieldName]?.valid || false
 *    - If no fieldName: iterates all fields, returns false if any invalid
 *
 * ## KEY IMPLEMENTATION DETAILS
 *
 * ### Group Data Structure
 *
 * The summary.groups structure is:
 * ```
 * groups: {
 *   'groupName1': {
 *     'field1': {
 *       errorCount: 2,
 *       warnCount: 1,
 *       testCount: 3,
 *       pendingCount: 0,
 *       errors: ['error message 1', 'error message 2'],
 *       warnings: ['warning message'],
 *       valid: false
 *     },
 *     'field2': { ... }
 *   },
 *   'groupName2': { ... }
 * }
 * ```
 *
 * ### Severity System
 *
 * Vest uses two parallel systems for severity:
 * 1. Severity enum (ERRORS, WARNINGS) - used as keys for message arrays
 * 2. SeverityCount enum (ERROR_COUNT, WARN_COUNT) - used as keys for counts
 *
 * The `countKeyBySeverity()` function maps between them:
 * - Severity.ERRORS → SeverityCount.ERROR_COUNT
 * - Severity.WARNINGS → SeverityCount.WARN_COUNT
 *
 * ### Test Status vs Severity
 *
 * Tests have both status and severity:
 * - Status: PASSING, FAILED, WARNING, SKIPPED, OMITTED, CANCELED, UNTESTED, PENDING
 * - Severity: Error or Warning (set by warn() function)
 *
 * A failing test can be either:
 * - ERROR: status=FAILED, severity=Error
 * - WARNING: status=WARNING, severity=Warning
 *
 * ### Validity Computation
 *
 * A field is valid in a group when ALL of these are true:
 * 1. The field is optional AND condition is met, OR
 * 2. No error-level failures (warnings don't affect validity)
 * 3. No non-optional incomplete (pending) tests
 * 4. No missing tests (all tests ran or were omitted)
 *
 * A group is valid when ALL fields in it are valid.
 *
 * ### Optional Fields in Groups
 *
 * Optional fields are handled specially:
 * - Even if an optional field has errors, it can be valid
 * - isValidByGroup(group) checks each field's validity individually
 * - Optional fields with errors return true for isValidByGroup(group, optionalField)
 * - But still contribute to hasErrorsByGroup() and getErrorsByGroup()
 *
 * ### Group Nesting
 *
 * Groups can be nested (group within group):
 * - Each test only has ONE groupName (the innermost group)
 * - Nested groups are treated as separate, independent groups
 * - A test in a nested group does NOT appear in the parent group's stats
 *
 * ### Async Tests in Groups
 *
 * While async tests are pending:
 * - hasErrorsByGroup() returns false (no error yet)
 * - isValidByGroup() returns false (incomplete)
 * - getErrorsByGroup() returns empty
 *
 * After completion:
 * - Stats are updated with actual results
 * - Validity is recomputed
 *
 * ## SELECTOR FUNCTION SIGNATURES
 *
 * All byGroup selectors follow consistent patterns:
 *
 * ### hasErrorsByGroup / hasWarningsByGroup
 * ```
 * hasErrorsByGroup(groupName: G): boolean
 * hasErrorsByGroup(groupName: G, fieldName: F): boolean
 * ```
 * - Returns true if ANY field in group has errors (no fieldName)
 * - Returns true if SPECIFIC field in group has errors (with fieldName)
 *
 * ### getErrorsByGroup / getWarningsByGroup
 * ```
 * getErrorsByGroup(groupName: G): FailureMessages
 * getErrorsByGroup(groupName: G, fieldName: F): string[]
 * ```
 * - Returns { fieldName: messages[] } for all fields (no fieldName)
 * - Returns messages[] for specific field (with fieldName)
 *
 * ### isValidByGroup
 * ```
 * isValidByGroup(groupName: G): boolean
 * isValidByGroup(groupName: G, fieldName: F): boolean
 * ```
 * - Returns true if ALL fields in group are valid (no fieldName)
 * - Returns true if SPECIFIC field in group is valid (with fieldName)
 *
 * ## INTEGRATION WITH SUITE API
 *
 * ### Export and Exposure
 *
 * The byGroup selectors are exposed in three ways:
 *
 * 1. **On SuiteResult objects** (from suite() or suite.get()):
 *    ```typescript
 *    const result = suite();
 *    result.hasErrorsByGroup('groupName');
 *    ```
 *
 * 2. **On Suite objects directly** (convenience wrappers):
 *    ```typescript
 *    suite.hasErrorsByGroup('groupName'); // calls suite.get().hasErrorsByGroup()
 *    ```
 *
 * 3. **As standalone export** (for advanced use):
 *    ```typescript
 *    import { suiteSelectors } from 'vest';
 *    const selectors = suiteSelectors(summary);
 *    ```
 *
 * ### Consistency with Non-Group Selectors
 *
 * The byGroup selectors are designed to mirror their non-group counterparts:
 * - hasErrors() → hasErrorsByGroup()
 * - hasWarnings() → hasWarningsByGroup()
 * - getErrors() → getErrorsByGroup()
 * - getWarnings() → getWarningsByGroup()
 * - isValid() → isValidByGroup()
 *
 * They share the same implementation patterns:
 * - Same function overloading approach (with/without fieldName)
 * - Same return types (boolean, string[], FailureMessages)
 * - Same severity handling
 * - Same treatment of optional fields
 *
 * ### Position in SuiteSelectors Interface
 *
 * In the SuiteSelectors interface (suiteSelectors.ts), the byGroup selectors
 * are positioned alongside their non-group equivalents:
 *
 * ```typescript
 * interface SuiteSelectors<F, G> {
 *   // Single value getters
 *   getError(fieldName?: F): ...
 *   getWarning(fieldName?: F): ...
 *   getMessage(fieldName: F): ...
 *
 *   // Collection getters
 *   getErrors(fieldName?: F): ...
 *   getWarnings(fieldName?: F): ...
 *   getErrorsByGroup(groupName: G, fieldName?: F): ...  // ← Group version
 *   getWarningsByGroup(groupName: G, fieldName?: F): ... // ← Group version
 *
 *   // Boolean checks
 *   hasErrors(fieldName?: F): boolean
 *   hasWarnings(fieldName?: F): boolean
 *   hasErrorsByGroup(groupName: G, fieldName?: F): boolean    // ← Group version
 *   hasWarningsByGroup(groupName: G, fieldName?: F): boolean  // ← Group version
 *
 *   // Validity checks
 *   isTested(fieldName: F): boolean
 *   isPending(fieldName?: F): boolean
 *   isValid(fieldName?: F): boolean
 *   isValidByGroup(groupName: G, fieldName?: F): boolean      // ← Group version
 * }
 * ```
 *
 * ## PERFORMANCE CHARACTERISTICS
 *
 * ### Time Complexity
 *
 * - hasErrorsByGroup(group): O(n) where n = fields in group
 * - hasErrorsByGroup(group, field): O(1) - direct lookup
 * - getErrorsByGroup(group): O(n) where n = fields with errors in group
 * - getErrorsByGroup(group, field): O(1) - direct lookup
 * - isValidByGroup(group): O(n) where n = fields in group
 * - isValidByGroup(group, field): O(1) - direct lookup
 *
 * ### Space Complexity
 *
 * Groups are stored redundantly:
 * - Each test appears in both summary.tests[field] AND summary.groups[group][field]
 * - Error messages are stored in both locations
 * - This trades space for query performance (no filtering needed at query time)
 *
 * ### Caching and Memoization
 *
 * - SuiteSummary is computed once per suite execution
 * - The summary is cached in useSuiteResultCache()
 * - Selectors are pure functions over the cached summary
 * - No additional caching at selector level
 *
 * ## EDGE CASES AND SPECIAL BEHAVIORS
 *
 * ### Non-existent Group
 * - hasErrorsByGroup('nonexistent') → false
 * - getErrorsByGroup('nonexistent') → {}
 * - isValidByGroup('nonexistent') → false
 *
 * ### Non-existent Field in Group
 * - hasErrorsByGroup('group', 'nonexistent') → false
 * - getErrorsByGroup('group', 'nonexistent') → []
 * - isValidByGroup('group', 'nonexistent') → false
 *
 * ### Empty Group
 * - hasErrorsByGroup('empty') → false
 * - getErrorsByGroup('empty') → {}
 * - isValidByGroup('empty') → true (vacuous truth)
 *
 * ### Field Both Inside and Outside Group
 * - Tests outside group: counted in summary.tests[field] only
 * - Tests inside group: counted in BOTH summary.tests[field] AND groups[group][field]
 * - byGroup selectors only see the group stats
 * - Regular selectors see the combined stats
 *
 * ### Tests Without Messages
 * - hasErrorsByGroup() still returns true
 * - getErrorsByGroup() returns empty array [] for that field
 * - This is consistent with non-group behavior
 *
 * ### Skipped vs Omitted Tests in Groups
 * - Skipped: counted as incomplete, makes group invalid
 * - Omitted: not counted at all, doesn't affect group validity
 * - Both excluded from error/warning collections
 *
 * ## TESTING STRATEGY
 *
 * This test file covers:
 * 1. Basic functionality for each selector
 * 2. Variations with/without fieldName parameter
 * 3. Separation of errors and warnings
 * 4. Async test handling
 * 5. Optional field handling
 * 6. Skip/omit behavior
 * 7. Multiple groups
 * 8. Nested groups
 * 9. Edge cases (empty group, non-existent group, etc.)
 * 10. Consistency between SuiteRunResult and SuiteResult
 * 11. Special characters in names
 * 12. Large-scale scenarios
 *
 * ## RELATED CONCEPTS
 *
 * ### Difference from include().when()
 * - include() dynamically adds fields to execution
 * - group() statically organizes tests into logical units
 * - byGroup selectors query the static organization
 *
 * ### Relationship to focus (only/skip)
 * - only/skip control which tests execute
 * - group() controls how tests are organized
 * - byGroup selectors query the organization, not the execution
 *
 * ### Interaction with Modes (EAGER, ALL, ONE)
 * - Modes control execution flow
 * - Groups control organization
 * - byGroup selectors work the same regardless of mode
 *
 * ## HISTORICAL CONTEXT
 *
 * The byGroup selectors were added to enable:
 * - Multi-step forms with per-step validation
 * - Tabbed interfaces with per-tab validation
 * - Wizard flows with per-stage validation
 * - Complex forms with logical sections
 *
 * They allow checking "Is this section/step/tab valid?" without having to
 * manually track which fields belong to which section.
 *
 * ============================================================================
 */
