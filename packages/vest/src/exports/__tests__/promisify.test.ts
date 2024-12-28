import { faker } from '@faker-js/faker';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';
import { TestPromise } from '../../testUtils/testPromise';
import promisify from '../promisify';

import { TFieldName } from 'SuiteResultTypes';
import * as vest from 'vest';

describe('Utility: promisify', () => {
  let suite: vi.Mock<vest.SuiteResult<string, TFieldName>, any>;
  let validateAsync: (
    ...args: any[]
  ) => Promise<vest.SuiteResult<string, TFieldName>>;

  beforeEach(() => {
    suite = vi.fn(
      vest.create(
        vi.fn(() => {
          dummyTest.failing('field_0');
        }),
      ).run,
    );
    validateAsync = promisify(suite);
  });

  describe('Test arguments', () => {
    it('Should throw an error', () => {
      // @ts-expect-error - testing invalid input
      const invalidValidateAsync = promisify('invalid');
      expect(() => invalidValidateAsync()).toThrow();
    });
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof promisify(vi.fn())).toBe('function');
    });

    it('should be a promise', () =>
      TestPromise(done => {
        const res = validateAsync();
        expect(typeof res?.then).toBe('function');
        res.then(() => done());
      }));
  });

  describe('When returned function is invoked', () => {
    it('Calls `suite` argument', () =>
      TestPromise(done => {
        const validateAsync = promisify(
          vest.create(() => {
            dummyTest.failing('field_0');
            done();
          }).run,
        );
        validateAsync();
      }));

    it('Passes all arguments over to tests callback', async () => {
      const params = [
        1,
        { [faker.lorem.word()]: [1, 2, 3] },
        false,
        [faker.lorem.word()],
      ];

      await validateAsync(...params);
      expect(suite).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    it('Produces correct validation', () =>
      TestPromise(done => {
        const suite = vest.create(() => {
          dummyTest.failing('field_0');
          dummyTest.failingAsync('field_1');
        }).run;

        const validatorAsync = promisify(suite);
        const p = validatorAsync('me');

        p.then(result => {
          expect(result.hasErrors('field_0')).toBe(true);
          expect(result.hasErrors('field_1')).toBe(true);
          done();
        });
      }));
  });
});
