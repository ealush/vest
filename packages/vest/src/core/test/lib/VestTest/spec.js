import mock from '../../../../../testUtils/mock';
import VestTest from '.';

const suiteId = 'validation-suite';

const fieldName = 'unicycle';
const statement = 'I am Root.';

describe('VestTest', () => {
  let testObject;

  beforeEach(() => {
    testObject = new VestTest({
      suiteId,
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
      () => new VestTest({ suiteId, fieldName, statement, testFn: jest.fn() })
    ).reduce((existing, { id }) => {
      expect(existing[id]).toBeUndefined();
      existing[id] = true;
      return existing;
    }, {});
  });

  describe('testObject.warn', () => {
    it('Should return current instance', () => {
      expect(testObject.warn()).toBe(testObject);
    });

    it('Should set `.isWarning` to true', () => {
      expect(testObject.isWarning).toBe(false);
      testObject.warn();
      expect(testObject.isWarning).toBe(true);
      expect(testObject).toMatchSnapshot();
    });
  });

  describe('testObject.fail', () => {
    let mockPatch, res;

    const stateMock = () => ({
      tests: {
        [fieldName]: {
          errors: [],
          warnings: [],
          errorCount: 0,
          warnCount: 0,
        },
      },
      groups: {},
    });

    const initialState = stateMock();

    beforeEach(() => {
      mockPatch = mock('patch', (key, patcher) => patcher(stateMock()));
      jest.resetModules();

      const VestTest = require('.');
      testObject = new VestTest({
        suiteId,
        fieldName,
        statement,
        testFn: jest.fn(),
      });
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe('When severity = error', () => {
      it('Should bump error counters and messages', () => {
        testObject.fail();
        res = mockPatch.mock.results[0].value;
        expect(res.tests[fieldName].errors).toEqual([statement]);
        expect(res.tests[fieldName].warnings).toEqual([]);
        expect(res.tests[fieldName].errorCount).toBe(
          initialState.tests[fieldName].errorCount + 1
        );
        expect(res.tests[fieldName].warnCount).toBe(
          initialState.tests[fieldName].warnCount
        );
        expect(res).toMatchSnapshot();
      });
    });

    describe('When severity = warn', () => {
      it('Should bump error counters and messages', () => {
        testObject.isWarning = true;
        testObject.fail();
        res = mockPatch.mock.results[0].value;
        expect(res.tests[fieldName].warnings).toEqual([statement]);
        expect(res.tests[fieldName].errors).toEqual([]);
        expect(res.tests[fieldName].warnCount).toBe(
          initialState.tests[fieldName].warnCount + 1
        );
        expect(res.tests[fieldName].errorCount).toBe(
          initialState.tests[fieldName].errorCount
        );
        expect(res).toMatchSnapshot();
      });
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
