import faker from 'faker';
import mock from '../../../testUtils/mock';

describe('runWithContext', () => {
  let parent, fn, mockContext, result, runWithContext, singleton;

  beforeEach(() => {
    singleton = require('../singleton');

    result = faker.random.word();
    parent = { [faker.random.word()]: faker.lorem.word() };
    fn = jest.fn(() => result);
    singleton = require('../singleton');
    runWithContext = require('.');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Should call callback function after creating the context', () => {
    expect(singleton.useContext()).toBeFalsy();
    const fn = jest.fn(() => {
      expect(singleton.useContext()).toMatchObject(parent);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Should pass context to callback', () => {
    const fn = jest.fn(context => {
      expect(singleton.useContext()).toMatchObject(context);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Should clear context after running callback', () => {
    const fn = jest.fn(context => {
      expect(singleton.useContext()).toMatchObject(context);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(singleton.useContext()).toBeNull();
  });

  it("Should return with the callback function's return value", () => {
    expect(runWithContext(parent, fn)).toBe(result);
  });

  describe('Calls to context', () => {
    beforeEach(() => {
      mockContext = mock('Context');
      mockContext.clear = jest.fn();
      singleton = require('../singleton');
      runWithContext = require('.');
      runWithContext(parent, fn);
    });
    it('Should create a new context with the parent object', () => {
      expect(mockContext).toHaveBeenCalledWith(parent);
    });
  });

  describe('When an error is thrown inside the callback', () => {
    let cb;

    beforeEach(() => {
      cb = jest.fn(() => {
        throw new Error();
      });
    });

    test('sanity', () => {
      expect(() => cb()).toThrow();
    });

    it('Should catch error', () => {
      expect(() => {
        runWithContext({}, cb);
      }).not.toThrow();

      expect(cb).toHaveBeenCalled();
    });

    it('Should clear the context', () => {
      const context = { [faker.random.word()]: faker.random.word() };

      runWithContext(context, () => {
        expect(singleton.useContext()).toMatchObject(context);
        throw new Error();
      });
      expect(singleton.useContext()).toBeNull();
    });
  });
});
