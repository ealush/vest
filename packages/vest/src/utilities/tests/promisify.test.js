import faker from 'faker';
import vest from '../..';
import { dummyTest } from '../../../testUtils/testDummy';
import { promisify } from '../promisify';

describe('Utility: promisify', () => {
  let validatorFn;
  let validateAsync;

  beforeEach(() => {
    validatorFn = jest.fn(() => vest.validate('test-promisify', jest.fn()));
    validateAsync = promisify(validatorFn);
  });

  describe('Test arguments', () => {
    it('Should throw an error', () => {
      const invalidValidateAsync = promisify('invalid');
      expect(() => invalidValidateAsync()).toThrow();
    });
  });

  describe('Return value', () => {
    it('should be a function', () => {
      expect(typeof promisify(jest.fn())).toBe('function');
    });

    it('should be a promise', () =>
      new Promise(done => {
        const res = validateAsync();
        expect(typeof res?.then).toBe('function');
        res.then(() => done());
      }));
  });

  describe('When returned function is invoked', () => {
    it('Calls `validatorFn` argument', () =>
      new Promise(done => {
        const validateAsync = promisify(() =>
          vest.validate('test-promisify', () => done())
        );
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
      new Promise(done => {
        const validate = vest.create('test-promisify', () => {
          dummyTest.failing('field_0');
          dummyTest.failingAsync('field_1');
        });

        const validateAsync = promisify(validate);

        const promise = validateAsync();
        const res = vest.get('test-promisify');

        expect(res.hasErrors('field_0')).toBe(true);
        expect(res.hasErrors('field_1')).toBe(false);

        promise.then(result => {
          expect(result.hasErrors('field_0')).toBe(true);
          expect(result.hasErrors('field_1')).toBe(true);
          expect(result).not.toBe(res);
          expect(result).not.isDeepCopyOf(res);
          done();
        });
      }));
  });
});
