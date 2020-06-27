import mock from '../../../../../shared/testUtils/mock';
import resetState from '../../../testUtils/resetState';
import runSpec from '../../../testUtils/runSpec';
import testDummy from '../../../testUtils/testDummy';
import getSuiteState from '../../core/state/getSuiteState';
import VestTest from '../../core/test/lib/VestTest';
import singleton from '../../lib/singleton';

const faker = require('faker');
const { ERROR_HOOK_CALLED_OUTSIDE } = require('../constants');
const { isExcluded, isGroupExcluded } = require('.');

const suiteId = 'suite-id';

runSpec(vest => {
  let res, res1;
  const { group } = vest;

  afterEach(() => {
    resetState();
  });

  describe('exclusive hooks', () => {
    let field1, field2, field3;

    beforeEach(() => {
      field1 = new VestTest({
        suiteId,
        fieldName: faker.lorem.word(),
      });
      field2 = new VestTest({
        suiteId,
        fieldName: faker.lorem.slug(),
      });
      field3 = new VestTest({
        suiteId,
        fieldName: faker.random.word(),
      });
    });

    test('isExcluded should respect group exclusion', () => {
      let testObject;
      let testObject1;
      vest.create(faker.random.word(), () => {
        vest.skip.group('group_1');

        testObject = testDummy(vest).failing();

        group('group_1', () => {
          testObject1 = testDummy(vest).failing();
        });

        const ctx = singleton.useContext();
        const state = getSuiteState(ctx.suiteId);
        res = isExcluded(state, testObject);
        res1 = isExcluded(state, testObject1);
      })();

      expect(res).toBe(false);
      expect(res1).toBe(true);
    });

    describe('`only` hook', () => {
      describe('string input', () => {
        test('isExcluded returns false for included field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only(field1.fieldName);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isExcluded(state, field1);
          })();
          expect(res).toBe(false);
        });

        test('isGroupExcluded returns false for included groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only('group_name');

            group('group_name', () => {
              const ctx = singleton.useContext();
              const state = getSuiteState(ctx.suiteId);
              res = isGroupExcluded(state, 'group_name');
            });
          })();
          expect(res).toBe(false);
        });

        test('isExcluded returns true for non included field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only(field1.fieldName);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res1 = isExcluded(state, field1);
            res = isExcluded(state, field2);
          })();
          expect(res1).toBe(false);
          expect(res).toBe(true);
        });

        test('isGroupExcluded returns true for non included group', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only.group('group_1');

            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            group('group_1', Function.prototype);
            group('group_2', Function.prototype);

            res1 = isGroupExcluded(state, 'group_1');
            res = isGroupExcluded(state, 'group_2');
          })();

          expect(res1).toBe(false);
          expect(res).toBe(true);
        });
      });

      describe('array input', () => {
        test('isExcluded returns false for included field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only([field1.fieldName, field2.fieldName]);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isExcluded(state, field1);
            res1 = isExcluded(state, field2);
          })();
          expect(res).toBe(false);
          expect(res1).toBe(false);
        });

        test('isGroupExcluded returns false for included groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only.group(['group_1', 'group_2']);

            group('group_1', Function.prototype);
            group('group_2', Function.prototype);
            group('group_3', Function.prototype);

            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);

            res = [
              isGroupExcluded(state, 'group_1'),
              isGroupExcluded(state, 'group_2'),
              isGroupExcluded(state, 'group_3'),
            ];
          })();
          expect(res).toEqual([false, false, true]);
        });

        test('isExcluded returns true for non included field', () => {
          vest.create(faker.lorem.word(), () => {
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = [
              isExcluded(state, field1),
              isExcluded(state, field2),
              isExcluded(state, field3),
            ];
            vest.only([field1.fieldName, field2.fieldName]);
            res1 = [
              isExcluded(state, field1),
              isExcluded(state, field2),
              isExcluded(state, field3),
            ];
          })();
          expect(res).toEqual([false, false, false]);
          expect(res1).toEqual([false, false, true]);
        });

        test('isGroupExcluded returns true for non included groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.only.group(['group_1', 'group_2']);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);

            group('group_3', Function.prototype);
            res = [
              isGroupExcluded(state, 'group_1'),
              isGroupExcluded(state, 'group_2'),
              isGroupExcluded(state, 'group_3'),
            ];
          })();
          expect(res).toEqual([false, false, true]);
        });
      });
    });

    describe('`skip` hook', () => {
      describe('string input', () => {
        test('isExcluded returns true for excluded field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip(field1.fieldName);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isExcluded(state, field1);
          })();
          expect(res).toBe(true);
        });

        test('isGroupExcluded returns true for excluded groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip.group('group_1');
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isGroupExcluded(state, 'group_1');
            res1 = isGroupExcluded(state, 'group_2');
          })();

          expect(res).toBe(true);
          expect(res1).toBe(false);
        });

        test('isExcluded returns false for non excluded field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip(field1.fieldName);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isExcluded(state, field2);
          })();
          expect(res).toBe(false);
        });
      });

      test('isGroupExcluded returns false for non excluded groups', () => {
        vest.create(faker.lorem.word(), () => {
          vest.skip('group_1');
          const ctx = singleton.useContext();
          const state = getSuiteState(ctx.suiteId);
          res = isExcluded(state, 'group_2');
        })();
        expect(res).toBe(false);
      });

      describe('array input', () => {
        test('isExcluded returns true for excluded field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip([field1.fieldName, field2.fieldName]);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);

            res = isExcluded(state, field1);
            res1 = isExcluded(state, field2);
          })();
          expect(res).toBe(true);
          expect(res1).toBe(true);
        });

        test('isGroupExcluded returns true for excluded groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip.group(['group_1', 'group_2']);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = [
              isGroupExcluded(state, 'group_1'),
              isGroupExcluded(state, 'group_2'),
            ];
          })();
          expect(res).toEqual([true, true]);
        });

        test('isExcluded returns false for non included field', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip([field1.fieldName, field2.fieldName]);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isExcluded(state, field3);
          })();
          expect(res).toBe(false);
        });

        test('isGroupExcluded returns false for non excluded groups', () => {
          vest.create(faker.lorem.word(), () => {
            vest.skip(['group_1', 'group_2']);
            const ctx = singleton.useContext();
            const state = getSuiteState(ctx.suiteId);
            res = isGroupExcluded(state, 'group_3');
          })();
          expect(res).toEqual(false);
        });
      });
    });

    describe('Error handling', () => {
      let mockThrowError, hooks;

      beforeEach(() => {
        mockThrowError = mock('throwError');
        hooks = require('.');
      });

      describe.each([['only', 'skip']])('%s', hook => {
        describe('When called outside of a suite', () => {
          it('Should throw an error', () => {
            hooks[hook](faker.random.word());
            expect(mockThrowError.mock.calls[0][0]).toContain(
              ERROR_HOOK_CALLED_OUTSIDE
            );
          });
        });
      });
    });
  });
});

describe('isExcluded', () => {
  let state;

  const genState = ({ tests = {}, groups = {} }) => ({
    exclusion: { tests, groups },
  });
  const genTest = (fieldName, groupName) => ({ fieldName, groupName });
  describe('skip', () => {
    beforeEach(() => {
      state = genState({ tests: { field_1: false, field_2: false } });
    });
    it('returns true for skipped field', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_1'))).toBe(true);
    });
    it('returns false for non skipped field', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_4', 'group_1'))).toBe(false);
    });
  });
  describe('only', () => {
    beforeEach(() => {
      state = genState({ tests: { field_1: true, field_2: true } });
    });
    it('returns false for included field', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2', 'group_1'))).toBe(false);
    });
    it('returns true for non included field', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_4', 'group_1'))).toBe(true);
    });
  });
  describe('only+skip', () => {
    beforeEach(() => {
      state = genState({
        tests: { field_1: true, field_2: true, field_3: false, field_4: false },
      });
    });
    it('returns false for included tests', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2', 'group_1'))).toBe(false);
    });
    it('returns true excluded tests', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_4', 'group_1'))).toBe(true);
    });
    it('returns true for non included field', () => {
      expect(isExcluded(state, genTest('field_5'))).toBe(true);
      expect(isExcluded(state, genTest('field_6', 'group_1'))).toBe(true);
    });
  });
  describe('skip.group', () => {
    beforeEach(() => {
      state = genState({
        groups: {
          group_1: false,
          group_2: false,
        },
      });
    });

    it('Returns true for tests in skipped group', () => {
      expect(isExcluded(state, genTest('field_1', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_2'))).toBe(true);
    });
    it('Returns false for tests in non skipped groups', () => {
      expect(isExcluded(state, genTest('field_3', 'group_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_4', 'group_4'))).toBe(false);
    });
    it('Returns false for tests outside of any group', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_4'))).toBe(false);
    });
  });
  describe('only.group', () => {
    beforeEach(() => {
      state = genState({
        groups: {
          group_1: true,
          group_2: true,
        },
      });
    });

    it('returns false for tests in included groups', () => {
      expect(isExcluded(state, genTest('field_1', 'group_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_1', 'group_2'))).toBe(false);
    });

    it('returns true for groups in non included groups', () => {
      expect(isExcluded(state, genTest('field_1', 'group_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_4'))).toBe(true);
    });

    it('returns false for tests outside of any group', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2'))).toBe(false);
    });
  });

  describe('only.group + only', () => {
    beforeEach(() => {
      state = genState({
        groups: {
          group_1: true,
          group_2: true,
        },
        tests: { field_1: true, field_2: true },
      });
    });

    it('returns false for included tests', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2'))).toBe(false);
    });

    it('returns false for included tests in included groups', () => {
      expect(isExcluded(state, genTest('field_1', 'group_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2', 'group_2'))).toBe(false);
    });

    it('returns true for included test in non included group', () => {
      expect(isExcluded(state, genTest('field_1', 'group_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_4'))).toBe(true);
    });

    it('returns true for non included test in included group', () => {
      expect(isExcluded(state, genTest('field_3', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_4', 'group_2'))).toBe(true);
    });

    it('returns true for non included tests', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_4'))).toBe(true);
    });
  });

  describe('skip.group + only', () => {
    beforeEach(() => {
      state = genState({
        groups: {
          group_1: false,
          group_2: false,
        },
        tests: { field_1: true, field_2: true },
      });
    });

    it('returns true for tests in excluded groups', () => {
      expect(isExcluded(state, genTest('field_1', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_3', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_1', 'group_2'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_2'))).toBe(true);
      expect(isExcluded(state, genTest('field_3', 'group_2'))).toBe(true);
    });

    it('returns false for tests in included tests in non excluded groups', () => {
      expect(isExcluded(state, genTest('field_1', 'group_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_2', 'group_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_1', 'group_4'))).toBe(false);
      expect(isExcluded(state, genTest('field_2', 'group_4'))).toBe(false);
    });

    it('returns true for non included tests', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_4'))).toBe(true);
    });

    it('returns false for included tests', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_2'))).toBe(false);
    });
  });

  describe('only.group + skip', () => {
    beforeEach(() => {
      state = genState({
        groups: {
          group_1: true,
          group_2: true,
        },
        tests: { field_1: false, field_2: false },
      });
    });

    it('returns true for excluded tests', () => {
      expect(isExcluded(state, genTest('field_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_2'))).toBe(true);
    });
    it('returns false for non excluded tests', () => {
      expect(isExcluded(state, genTest('field_3'))).toBe(false);
      expect(isExcluded(state, genTest('field_4'))).toBe(false);
    });
    it('returns true for excluded test in included group', () => {
      expect(isExcluded(state, genTest('field_1', 'group_1'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_2'))).toBe(true);
    });
    it('returns true for excluded test in non included group', () => {
      expect(isExcluded(state, genTest('field_1', 'group_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_2', 'group_4'))).toBe(true);
    });
    it('returns false for non excluded test in included group', () => {
      expect(isExcluded(state, genTest('field_3', 'group_1'))).toBe(false);
      expect(isExcluded(state, genTest('field_4', 'group_2'))).toBe(false);
    });
    it('returns true for non excluded test in non included group', () => {
      expect(isExcluded(state, genTest('field_3', 'group_3'))).toBe(true);
      expect(isExcluded(state, genTest('field_4', 'group_4'))).toBe(true);
    });
  });
});
