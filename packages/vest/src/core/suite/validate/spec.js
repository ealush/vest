import faker from 'faker';
import mock from '../../../../../shared/testUtils/mock';
import { OPERATION_MODE_STATELESS } from '../../constants';
import Context from '../Context';

let validate;

describe('module:validate', () => {
  let suiteName,
    tests,
    mockCreateSuite,
    returnedFn,
    mockCleanupCompletedSuite,
    output,
    suiteId;
  beforeEach(() => {
    returnedFn = jest.fn();
    tests = jest.fn();
    mockCleanupCompletedSuite = mock('cleanupCompletedSuite');
    suiteName = faker.lorem.word();
    suiteId = faker.random.number();
    mockCreateSuite = mock('createSuite', returnedFn);
    mock('id', () => suiteId);
    validate = require('.');
    output = validate(suiteName, tests);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Test arguments', () => {
    let mockValidateSuiteParams, name, tests;

    beforeEach(() => {
      mockValidateSuiteParams = mock('validateSuiteParams');
      validate = require('.');
      name = faker.random.word();
      tests = jest.fn();
    });

    it('Should call `validateSuiteParams` with passed arguments and current function name', () => {
      expect(mockValidateSuiteParams).not.toHaveBeenCalled();
      validate(name, tests);
      expect(mockValidateSuiteParams).toHaveBeenCalledWith(
        'validate',
        name,
        tests
      );
    });
  });

  it('Should set correct context for test run', () => {
    returnedFn = jest.fn(() => {
      expect(Context.use()).toEqual({
        name: suiteName,
        suite_id: suiteId,
        operationMode: OPERATION_MODE_STATELESS,
      });
    });
    mockCreateSuite = mock('createSuite', returnedFn);
    mock('id', () => suiteId);
    validate = require('.');
    validate(suiteName, tests);
    expect(returnedFn).toHaveBeenCalled();
  });

  it('Should call `createSuite` with passed arguments', () => {
    expect(mockCreateSuite).toHaveBeenCalledWith(suiteName, tests);
  });

  it("Should call `createSuite`'s returned function", () => {
    expect(returnedFn).toHaveBeenCalled();
  });

  it('Should return the returned function output', () => {
    expect(output).toBe(returnedFn.mock.results[0][0]);
  });

  it('Should call all functions in order', () => {
    const unsorted = [
      returnedFn.mock.invocationCallOrder,
      mockCreateSuite.mock.invocationCallOrder,
      mockCleanupCompletedSuite.mock.invocationCallOrder,
    ];

    expect(unsorted.sort()).toEqual([
      mockCreateSuite.mock.invocationCallOrder,
      returnedFn.mock.invocationCallOrder,
      mockCleanupCompletedSuite.mock.invocationCallOrder,
    ]);
  });

  describe('When `createSuite` does not return a function', () => {
    it('Should return silently', () => {
      const output = validate('');
      expect(output).toBeUndefined();
    });
  });
});
