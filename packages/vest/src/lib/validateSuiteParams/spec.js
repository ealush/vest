import faker from 'faker';
import validateSuiteParams from '.';

describe('validateSuiteParams', () => {
  let fnName, name, fn;
  beforeEach(() => {
    fnName = faker.random.word();
    name = faker.lorem.word();
    fn = jest.fn();
  });

  describe('When params passed correctly', () => {
    it('Should return silently', () => {
      expect(validateSuiteParams(fnName, name, fn)).toBeUndefined();
    });
  });

  describe('When name is not a string', () => {
    it.each([1, {}, [], false, undefined, null, NaN, Function.prototype])(
      'It should throw',
      name => {
        expect(() => validateSuiteParams(fnName, name, fn)).toThrow(
          `Wrong arguments passed to \`${fnName}\` function. Expected name to be a string.`
        );
      }
    );
  });

  describe('When fn is not a function', () => {
    it.each([1, {}, [], false, undefined, null, NaN, name])(
      'It should throw',
      fn => {
        expect(() => validateSuiteParams(fnName, name, fn)).toThrow(
          `Wrong arguments passed to \`${fnName}\` function. Expected tests to be a function.`
        );
      }
    );
  });
});
