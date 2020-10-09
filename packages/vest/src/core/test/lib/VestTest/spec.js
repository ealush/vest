import VestTest from '.';

const fieldName = 'unicycle';
const statement = 'I am Root.';

describe('VestTest', () => {
  let testObject;

  beforeEach(() => {
    testObject = new VestTest({
      fieldName,
      statement,
      testFn: jest.fn(),
    });
  });

  test('TestObject constructor', () => {
    expect(testObject).toMatchSnapshot();
  });

  it('Should have a unique id', () => {
    Array.from(
      { length: 100 },
      () => new VestTest({ fieldName, statement, testFn: jest.fn() })
    ).reduce((existing, { id }) => {
      expect(existing[id]).toBeUndefined();
      existing[id] = true;
      return existing;
    }, {});
  });

  describe('testObject.warn', () => {
    it('Should set `.isWarning` to true', () => {
      expect(testObject.isWarning).toBe(false);
      testObject.warn();
      expect(testObject.isWarning).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    beforeEach(() => {
      jest.resetModules();

      const VestTest = require('.');
      testObject = new VestTest({
        fieldName,
        statement,
        testFn: jest.fn(),
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('Should set this.failed to true', () => {
      expect(testObject.failed).toBe(false);
      testObject.fail();
      expect(testObject.failed).toBe(true);
    });
  });

  describe('testobject.valueOf', () => {
    test('When `failed` is false', () => {
      expect(testObject.failed).toBe(false);
      expect(testObject.valueOf()).toBe(true);
    });

    test('When `failed` is true', () => {
      testObject.failed = true;
      expect(testObject.valueOf()).toBe(false);
    });
  });
});
