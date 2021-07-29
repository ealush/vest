import faker from 'faker';
import * as vest from 'vest';

import { dummyTest } from '../../../testUtils/testDummy';
import promisify from '../promisify';

describe('Utility: promisify', () => {
  let validatorFn;
  let validateAsync;

  beforeEach(() => {
    validatorFn = jest.fn(vest.create(jest.fn()));
    validateAsync = promisify(validatorFn);
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
      expect(typeof promisify(jest.fn())).toBe('function');
    });

    it('should be a promise', () =>
      new Promise<void>(done => {
        const res = validateAsync();
        expect(typeof res?.then).toBe('function');
        res.then(() => done());
      }));
  });

  describe('When returned function is invoked', () => {
    it('Calls `validatorFn` argument', () =>
      new Promise<void>(done => {
        const validateAsync = promisify(vest.create(() => done()));
        validateAsync();
      }));

    it('Passes all arguments over to tests callback', async () => {
      const params = [
        1,
        { [faker.random.word()]: [1, 2, 3] },
        false,
        [faker.random.word()],
      ];

      await validateAsync(...params);
      expect(validatorFn).toHaveBeenCalledWith(...params);
    });
  });

  describe('Initial run', () => {
    it('Produces correct validation', () =>
      new Promise<void>(done => {
        const validate = vest.create(() => {
          dummyTest.failing('field_0');
          dummyTest.failingAsync('field_1');
        });

        const validatorAsync = promisify(validate);
        const p = validatorAsync('me');

        p.then(result => {
          expect(result.hasErrors('field_0')).toBe(true);
          expect(result.hasErrors('field_1')).toBe(true);
          done();
        });
      }));
  });
});
