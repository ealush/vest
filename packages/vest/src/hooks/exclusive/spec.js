import mock from '../../../testUtils/mock';
import runSpec from '../../../testUtils/runSpec';
import getSuiteState from '../../core/state/getSuiteState';
import VestTest from '../../core/test/lib/VestTest';
import singleton from '../../lib/singleton';

const faker = require('faker');
const { ERROR_HOOK_CALLED_OUTSIDE } = require('../constants');
const { isExcluded } = require('.');

const suiteId = 'suite-id';

runSpec(vest => {
  const { validate, only, skip } = vest;

  describe('exclusive hooks', () => {
    let field1, field2, field3;

    beforeEach(() => {
      new VestTest({
        suiteId,
        fieldName: faker.lorem.word(),
      });
      new VestTest({
        suiteId,
        fieldName: faker.lorem.slug(),
      });
      new VestTest({
        suiteId,
        fieldName: faker.random.word(),
      });
    });

    describe('`only` hook', () => {
      describe('string input', () => {
        test('isExcluded returns false for included field', () => {
          validate(faker.lorem.word(), () => {
            only(field1);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            isExcluded(state, field1);
            expect(isExcluded(state, field1)).toBe(false);
          });
        });

        test('isExcluded returns true for non included field', () => {
          validate(faker.lorem.word(), () => {
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field2)).toBe(false);
            only(field1);
            expect(isExcluded(state, field2)).toBe(true);
          });
        });
      });

      describe('array input', () => {
        test('isExcluded returns false for included field', () => {
          validate(faker.lorem.word(), () => {
            only([field1, field2]);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field1)).toBe(false);
            expect(isExcluded(state, field2)).toBe(false);
          });
        });

        test('isExcluded returns true for non included field', () => {
          validate(faker.lorem.word(), () => {
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field3)).toBe(false);
            only([field1, field2]);
            expect(isExcluded(state, field3)).toBe(true);
          });
        });
      });
    });

    describe('`skip` hook', () => {
      describe('string input', () => {
        test('isExcluded returns true for excluded field', () => {
          validate(faker.lorem.word(), () => {
            skip(field1);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field1)).toBe(true);
          });
        });

        test('isExcluded returns true for non excluded field', () => {
          validate(faker.lorem.word(), () => {
            skip(field1);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field2)).toBe(false);
          });
        });
      });

      describe('array input', () => {
        test('isExcluded returns true for excluded field', () => {
          validate(faker.lorem.word(), () => {
            skip([field1, field2]);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field1)).toBe(true);
            expect(isExcluded(state, field2)).toBe(true);
          });
        });

        test('isExcluded returns false for non included field', () => {
          validate(faker.lorem.word(), () => {
            skip([field1, field2]);
            const ctx = singleton.context();
            const state = getSuiteState(ctx.suiteId);
            expect(isExcluded(state, field3)).toBe(false);
          });
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
