import faker from 'faker';
import mock from '../../../../../../shared/testUtils/mock';
import { OPERATION_MODE_STATELESS } from '../../../constants';
import context from '../../context';

let validate;

describe('module:validate', () => {
  let suiteName, tests, mockCreateSuite, returnedFn, mockCleanupCompleted;

  beforeEach(() => {
    validate = require('.');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Test arguments', () => {
    it.each([
      undefined,
      null,
      Math.random(),
      Function.prototype,
      false,
      true,
      NaN,
      {},
      [],
    ])('Should throw an error when suite name is invalid (%s)', value => {
      expect(() => validate(value, Function.prototype)).toThrow(
        '[Vest]: Wrong arguments passed to `validate` function. Expected name to be a string.'
      );
    });
    it.each([
      undefined,
      null,
      Math.random(),
      'some value',
      false,
      true,
      NaN,
      {},
      [],
    ])('Should throw an error when tests callback is invalid (%s)', value => {
      expect(() => validate('suite name', value)).toThrow(
        '[Vest]: Wrong arguments passed to `validate` function. Expected tests to be a function.'
      );
    });
  });

  it('Should set correct context for test run', () => {
    let ctx;

    validate('suiteName', () => {
      ctx = context.use();
    });

    expect(ctx).toMatchObject({
      name: 'suiteName',
      operationMode: OPERATION_MODE_STATELESS,
    });
  });

  describe('Inner calls', () => {
    beforeEach(() => {
      returnedFn = jest.fn((_, cb) => () => cb());
      tests = jest.fn();
      mockCleanupCompleted = mock('cleanupCompleted');
      suiteName = faker.lorem.word();
      mockCreateSuite = mock('createSuite', returnedFn);
      validate = require('.');
    });

    it("Should call `createSuite`'s returned function", () => {
      validate(suiteName, tests);
      expect(returnedFn).toHaveBeenCalled();
    });

    it('Should return the returned function output', () => {
      const output = validate(suiteName, tests);
      expect(output).toBe(returnedFn.mock.results[0][0]);
    });

    it('Should call `createSuite` with passed arguments', () => {
      validate(suiteName, tests);
      expect(mockCreateSuite).toHaveBeenCalledWith(suiteName, tests);
    });

    it('Should call all functions in order', () => {
      const unsorted = [
        returnedFn.mock.invocationCallOrder,
        mockCreateSuite.mock.invocationCallOrder,
        mockCleanupCompleted.mock.invocationCallOrder,
      ];

      expect(unsorted.sort()).toEqual([
        mockCreateSuite.mock.invocationCallOrder,
        returnedFn.mock.invocationCallOrder,
        mockCleanupCompleted.mock.invocationCallOrder,
      ]);
    });
  });
});
