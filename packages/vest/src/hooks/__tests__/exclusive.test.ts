import faker from 'faker';

import { dummyTest } from '../../../testUtils/testDummy';

import VestTest from 'VestTest';
import context from 'ctx';
import { isExcluded, isGroupExcluded, skip, only } from 'exclusive';
import group from 'group';
import { ERROR_HOOK_CALLED_OUTSIDE } from 'hookErrors';
import * as vest from 'vest';

let res, res1;

describe('exclusive hooks', () => {
  let test1, test2, test3;

  beforeEach(() => {
    test1 = new VestTest(faker.lorem.word(), jest.fn());
    test2 = new VestTest(faker.lorem.slug(), jest.fn());
    test3 = new VestTest(faker.random.word(), jest.fn());
  });

  test('isExcluded should respect group exclusion', () => {
    let testObject;
    let testObject1;
    const validate = vest.create(() => {
      vest.skip.group('group_1');

      testObject = dummyTest.failing();

      group('group_1', () => {
        testObject1 = dummyTest.failing();
      });

      res = isExcluded(testObject);
      res1 = isExcluded(testObject1);
    });

    validate();

    expect(res).toBe(false);
    expect(res1).toBe(true);
  });

  describe('`only` hook', () => {
    describe('string input', () => {
      test('isExcluded returns false for included field', () => {
        vest.create(() => {
          vest.only(test1.fieldName);
          res = isExcluded(test1);
        })();
        expect(res).toBe(false);
      });

      test('isGroupExcluded returns false for included groups', () => {
        vest.create(() => {
          vest.only('group_name');

          group('group_name', () => {
            res = isGroupExcluded('group_name');
          });
        })();
        expect(res).toBe(false);
      });

      test('isExcluded returns true for non included field', () => {
        vest.create(() => {
          vest.only(test1.fieldName);
          res1 = isExcluded(test1);
          res = isExcluded(test2);
        })();
        expect(res1).toBe(false);
        expect(res).toBe(true);
      });

      test('isGroupExcluded returns true for non included group', () => {
        vest.create(() => {
          vest.only.group('group_1');

          group('group_1', jest.fn());
          group('group_2', jest.fn());

          res1 = isGroupExcluded('group_1');
          res = isGroupExcluded('group_2');
        })();

        expect(res1).toBe(false);
        expect(res).toBe(true);
      });
    });

    describe('array input', () => {
      test('isExcluded returns false for included field', () => {
        vest.create(() => {
          vest.only([test1.fieldName, test2.fieldName]);
          res = isExcluded(test1);
          res1 = isExcluded(test2);
        })();
        expect(res).toBe(false);
        expect(res1).toBe(false);
      });

      test('isGroupExcluded returns false for included groups', () => {
        vest.create(() => {
          vest.only.group(['group_1', 'group_2']);

          group('group_1', jest.fn());
          group('group_2', jest.fn());
          group('group_3', jest.fn());

          res = [
            isGroupExcluded('group_1'),
            isGroupExcluded('group_2'),
            isGroupExcluded('group_3'),
          ];
        })();
        expect(res).toEqual([false, false, true]);
      });

      test('isExcluded returns true for non included field', () => {
        vest.create(() => {
          res = [isExcluded(test1), isExcluded(test2), isExcluded(test3)];
          vest.only([test1.fieldName, test2.fieldName]);
          res1 = [isExcluded(test1), isExcluded(test2), isExcluded(test3)];
        })();
        expect(res).toEqual([false, false, false]);
        expect(res1).toEqual([false, false, true]);
      });

      test('isGroupExcluded returns true for non included groups', () => {
        vest.create(() => {
          vest.only.group(['group_1', 'group_2']);

          group('group_3', jest.fn());
          res = [
            isGroupExcluded('group_1'),
            isGroupExcluded('group_2'),
            isGroupExcluded('group_3'),
          ];
        })();
        expect(res).toEqual([false, false, true]);
      });
    });
  });

  describe('`skip` hook', () => {
    describe('string input', () => {
      test('isExcluded returns true for excluded field', () => {
        vest.create(() => {
          vest.skip(test1.fieldName);
          res = isExcluded(test1);
        })();
        expect(res).toBe(true);
      });

      test('isGroupExcluded returns true for excluded groups', () => {
        vest.create(() => {
          vest.skip.group('group_1');
          res = isGroupExcluded('group_1');
          res1 = isGroupExcluded('group_2');
        })();

        expect(res).toBe(true);
        expect(res1).toBe(false);
      });

      test('isExcluded returns false for non excluded field', () => {
        vest.create(() => {
          vest.skip(test1.fieldName);
          res = isExcluded(vest.test(test2, jest.fn()));
        })();
        expect(res).toBe(false);
      });
    });

    test('isGroupExcluded returns false for tests in non excluded groups', () => {
      vest.create(() => {
        vest.skip('group_1');
        res = isExcluded(vest.test('field_1', jest.fn()));
      })();
      expect(res).toBe(false);
    });

    describe('array input', () => {
      test('isExcluded returns true for excluded field', () => {
        vest.create(() => {
          vest.skip([test1.fieldName, test2.fieldName]);

          res = isExcluded(test1);
          res1 = isExcluded(test2);
        })();
        expect(res).toBe(true);
        expect(res1).toBe(true);
      });

      test('isGroupExcluded returns true for excluded groups', () => {
        vest.create(() => {
          vest.skip.group(['group_1', 'group_2']);
          res = [isGroupExcluded('group_1'), isGroupExcluded('group_2')];
        })();
        expect(res).toEqual([true, true]);
      });

      test('isExcluded returns false for non included field', () => {
        vest.create(() => {
          vest.skip([test1.fieldName, test2.fieldName]);
          res = isExcluded(test3);
        })();
        expect(res).toBe(false);
      });

      test('isGroupExcluded returns false for non excluded groups', () => {
        vest.create(() => {
          vest.skip(['group_1', 'group_2']);
          res = isGroupExcluded('group_3');
        })();
        expect(res).toEqual(false);
      });
    });
  });

  describe('Error handling', () => {
    describe('When called outside of a suite', () => {
      it('Should throw an error', () => {
        expect(() => only(faker.random.word())).toThrow(
          ERROR_HOOK_CALLED_OUTSIDE
        );
        expect(() => skip(faker.random.word())).toThrow(
          ERROR_HOOK_CALLED_OUTSIDE
        );
      });
    });
  });
});

describe('isExcluded', () => {
  let exclusion;

  const runIsExcluded = (exclusion, testObject: VestTest) =>
    context.run({}, ctx => {
      Object.assign(ctx.exclusion, exclusion);
      const res = isExcluded(testObject);

      return res;
    });

  const genTest = (fieldName: string, groupName?: string) =>
    new VestTest(fieldName, jest.fn(), {
      groupName,
    });
  describe('skip', () => {
    beforeEach(() => {
      exclusion = { tests: { field_1: false, field_2: false } };
    });
    it('returns true for skipped field', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
        true
      );
    });
    it('returns false for non skipped field', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
        false
      );
    });
  });
  describe('only', () => {
    beforeEach(() => {
      exclusion = { tests: { field_1: true, field_2: true } };
    });
    it('returns false for included field', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
        false
      );
    });
    it('returns true for non included field', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
        true
      );
    });
  });
  describe('only+skip', () => {
    beforeEach(() => {
      exclusion = {
        tests: { field_1: true, field_2: true, field_3: false, field_4: false },
      };
    });
    it('returns false for included tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
        false
      );
    });
    it('returns true excluded tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_1'))).toBe(
        true
      );
    });
    it('returns true for non included field', () => {
      expect(runIsExcluded(exclusion, genTest('field_5'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_6', 'group_1'))).toBe(
        true
      );
    });
  });
  describe('skip.group', () => {
    beforeEach(() => {
      exclusion = {
        groups: {
          group_1: false,
          group_2: false,
        },
      };
    });

    it('Returns true for tests in skipped group', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
        true
      );
    });
    it('Returns false for tests in non skipped groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_3'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_4'))).toBe(
        false
      );
    });
    it('Returns false for tests outside of any group', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(false);
    });
  });
  describe('only.group', () => {
    beforeEach(() => {
      exclusion = {
        groups: {
          group_1: true,
          group_2: true,
        },
      };
    });

    it('returns false for tests in included groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_2'))).toBe(
        false
      );
    });

    it('returns true for groups in non included groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
        true
      );
    });

    it('returns false for tests outside of any group', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(false);
    });
  });

  describe('only.group + only', () => {
    beforeEach(() => {
      exclusion = {
        groups: {
          group_1: true,
          group_2: true,
        },
        tests: { field_1: true, field_2: true },
      };
    });

    it('returns false for included tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(false);
    });

    it('returns false for included tests in included groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
        false
      );
    });

    it('returns true for included test in non included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
        true
      );
    });

    it('returns true for non included test in included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_2'))).toBe(
        true
      );
    });

    it('returns true for non included tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(true);
    });
  });

  describe('skip.group + only', () => {
    beforeEach(() => {
      exclusion = {
        groups: {
          group_1: false,
          group_2: false,
        },
        tests: { field_1: true, field_2: true },
      };
    });

    it('returns true for tests in excluded groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_2'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_2'))).toBe(
        true
      );
    });

    it('returns false for tests in included tests in non excluded groups', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_3'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_4'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
        false
      );
    });

    it('returns true for non included tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(true);
    });

    it('returns false for included tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(false);
    });
  });

  describe('only.group + skip', () => {
    beforeEach(() => {
      exclusion = {
        groups: {
          group_1: true,
          group_2: true,
        },
        tests: { field_1: false, field_2: false },
      };
    });

    it('returns true for excluded tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_1'))).toBe(true);
      expect(runIsExcluded(exclusion, genTest('field_2'))).toBe(true);
    });
    it('returns false for non excluded tests', () => {
      expect(runIsExcluded(exclusion, genTest('field_3'))).toBe(false);
      expect(runIsExcluded(exclusion, genTest('field_4'))).toBe(false);
    });
    it('returns true for excluded test in included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_1'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_2'))).toBe(
        true
      );
    });
    it('returns true for excluded test in non included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_1', 'group_3'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_2', 'group_4'))).toBe(
        true
      );
    });
    it('returns false for non excluded test in included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_1'))).toBe(
        false
      );
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_2'))).toBe(
        false
      );
    });
    it('returns true for non excluded test in non included group', () => {
      expect(runIsExcluded(exclusion, genTest('field_3', 'group_3'))).toBe(
        true
      );
      expect(runIsExcluded(exclusion, genTest('field_4', 'group_4'))).toBe(
        true
      );
    });
  });
});
