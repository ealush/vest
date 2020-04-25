import faker from 'faker';
import mock from '../../../testUtils/mock';
import { OPERATION_MODE_STATELESS } from '../../constants';
import singleton from '../../lib/singleton';

let validate;

describe('module:validate', () => {
  let suiteName,
    tests,
    mockCreateSuite,
    returnedFn,
    mockCleanupStatelessSuite,
    output,
    suiteId;
  beforeEach(() => {
    returnedFn = jest.fn();
    tests = jest.fn();
    mockCleanupStatelessSuite = mock('cleanupStatelessSuite');
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

  it('Should set correct context for test run', () => {
    returnedFn = jest.fn(() => {
      expect(singleton.useContext()).toEqual({
        name: suiteName,
        suiteId,
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
      mockCleanupStatelessSuite.mock.invocationCallOrder,
    ];

    expect(unsorted.sort()).toEqual([
      mockCreateSuite.mock.invocationCallOrder,
      returnedFn.mock.invocationCallOrder,
      mockCleanupStatelessSuite.mock.invocationCallOrder,
    ]);
  });

  describe('When `createSuite` does not return a function', () => {
    it('Should return silently', () => {
      const output = validate('');
      expect(output).toBeUndefined();
    });
  });
});
