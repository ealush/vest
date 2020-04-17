import faker from "faker";

describe("runWithContext", () => {
  let parent, fn, mockContext, result, runWithContext, singleton;

  beforeEach(() => {
    singleton = require("../singleton");

    result = faker.random.word();
    parent = { [faker.random.word()]: faker.lorem.word() };
    fn = jest.fn(() => result);
    singleton = require("../singleton");
    runWithContext = require(".");
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("Should call callback function after creating the context", () => {
    expect(singleton.useContext()).toBeFalsy();
    const fn = jest.fn(() => {
      expect(singleton.useContext()).toMatchObject(parent);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("Should return with the callback function's return value", () => {
    expect(runWithContext(parent, fn)).toBe(result);
  });

  describe("Calls to context", () => {
    beforeEach(() => {
      jest.resetModules();
      mockContext = jest.fn();
      mockContext.clear = jest.fn();
      jest.mock("../../core/Context/", () => ({
        __esModule: true,
        default: mockContext,
      }));
      singleton = require("../singleton");
      runWithContext = require(".");
      runWithContext(parent, fn);
    });
    it("Should create a new context with the parent object", () => {
      expect(mockContext).toHaveBeenCalledWith(parent);
    });

    it("Should clear the created context", () => {
      expect(mockContext.clear).toHaveBeenCalledTimes(1);
    });
  });
});
