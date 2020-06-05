import mock from '../../../testUtils/mock';
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
        vest.skip('group_1');

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
            vest.only('group_1');

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
            vest.only(['group_1', 'group_2']);

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
            vest.only(['group_1', 'group_2']);
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
            vest.skip('group_1');
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
            vest.skip(['group_1', 'group_2']);
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
