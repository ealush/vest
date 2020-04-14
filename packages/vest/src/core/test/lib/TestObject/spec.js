import TestObject from ".";

const createContext = (data = {}) => ({
  result: {
    markFailure: jest.fn(),
  },
  ...data,
});

const fieldName = "unicycle";
const statement = "I am Root.";

describe("TestObject", () => {
  let context, testObject;

  beforeEach(() => {
    context = createContext();
    testObject = new TestObject(context, fieldName, statement, jest.fn());
  });

  test("TestObject constructor", () => {
    expect(testObject).toMatchSnapshot();
  });

  describe("testObject.warn", () => {
    it("Should return current instance", () => {
      expect(testObject.warn()).toBe(testObject);
    });

    it("Should set `.isWarning` to true", () => {
      expect(testObject.isWarning).toBe(false);
      testObject.warn();
      expect(testObject.isWarning).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe("testObject.fail", () => {
    it("Should call `ctx.result.markFailure`", () => {
      expect(context.result.markFailure).not.toHaveBeenCalled();
      testObject.fail();
      expect(context.result.markFailure).toHaveBeenCalledWith({
        fieldName,
        statement,
        isWarning: testObject.isWarning,
      });
    });

    it("Should return current instance", () => {
      expect(testObject.fail()).toBe(testObject);
    });

    it("Should set `.faild` to true", () => {
      expect(testObject.failed).toBe(false);
      testObject.fail();
      expect(testObject.failed).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe("testobject.valueOf", () => {
    test("When `failed` is false", () => {
      expect(testObject.failed).toBe(false);
      expect(testObject.valueOf()).toBe(true);
    });

    test("When `failed` is false", () => {
      testObject.fail();
      expect(testObject.valueOf()).toBe(false);
    });
  });
});
