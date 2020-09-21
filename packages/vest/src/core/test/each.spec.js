import vest from '../../';
import test from '.';

describe('test.each', () => {
  let mockFn;

  beforeEach(() => {
    mockFn = jest.fn();
  });

  describe('Sync tests', () => {
    it('Should be a function', () => {
      expect(typeof test.each).toBe('function');
    });

    it('Should return a function', () => {
      expect(typeof test.each([[1, 2]])).toBe('function');
    });

    it('Should throw an error', () => {
      expect(() => test.each()).toThrow('test.each must get array of arrays');
    });

    it('Should run mock function', () => {
      vest.validate('instance name', () => {
        const table = [[1, 2, 3]];
        test.each(table)('FieldName', 'some message', mockFn);
        expect(mockFn).toHaveBeenCalledWith(...table[0]);
      });
    });

    it('Should run test on each item on the table', () => {
      const table = new Array(10).fill([1, 2, 3]);
      vest.validate('instance name', () => {
        test.each(table)('FieldName', 'some message', mockFn);
        expect(mockFn).toHaveBeenCalledTimes(table.length);
      });
    });

    it('Should have error when test is failed', () => {
      const errorMessage = 'mock error message';
      const vestResponse = vest.validate('instance name', () => {
        const table = [[1, 2, 3]];
        test.each(table)('FieldName', errorMessage, a =>
          vest.enforce(a).greaterThan(5)
        );
      });
      expect(vestResponse.hasErrors()).toBe(true);
    });
  });
});
