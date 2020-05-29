import faker from 'faker';
import runWithContext from '../../../../lib/runWithContext';
import VestTest from '../VestTest';
import runTest from '.';

describe('runTest', () => {
  let testObject, context, callback, result;

  const runRunTest = (testObject, cb) =>
    runWithContext(context, () => runTest(testObject, cb));

  beforeEach(() => {
    callback = jest.fn(() => ({}));
    context = {
      setCurrentTest: jest.fn(),
      removeCurrentTest: jest.fn(),
    };
    testObject = new VestTest({
      suiteId: 'suite_id',
      fieldName: faker.random.word(),
      statement: faker.lorem.sentence(),
      testFn: jest.fn(),
    });
  });

  describe('When callback is undefined', () => {
    beforeEach(() => {
      result = runRunTest(testObject);
    });
    it('Should return without setting context', () => {
      expect(context.setCurrentTest).not.toHaveBeenCalled();
    });
    it('Should return without calling callback', () => {
      expect(callback).not.toHaveBeenCalled();
    });

    it('Should return undefined', () => {
      expect(result).toBeUndefined();
    });
  });

  describe('When callback is defined', () => {
    beforeEach(() => {
      result = runRunTest(testObject, callback);
    });

    it('Should call `setCurrentTest` with testObject', () => {
      expect(context.setCurrentTest).toHaveBeenCalledWith(testObject);
    });

    it('Should call removeCurrentTest', () => {
      expect(context.removeCurrentTest).toHaveBeenCalled();
    });

    it('Should call callback', () => {
      expect(callback).toHaveBeenCalled();
    });

    it("Should return with callback's output", () => {
      expect(result).toBe(callback.mock.results[0].value);
    });

    it('Should call all functions in order', () => {
      const [first] = context.setCurrentTest.mock.invocationCallOrder;
      const [second] = callback.mock.invocationCallOrder;
      const [third] = context.removeCurrentTest.mock.invocationCallOrder;
      expect([third, second, first].sort()).toEqual([first, second, third]);
    });
  });
});
