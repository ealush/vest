import { IsolateTypes } from 'IsolateTypes';

describe('isolate', () => {
  let firstRun = true;
  let vest, isolate, skipWhen, dummyTest;
  let throwError, throwErrorDeferred;

  beforeEach(() => {
    firstRun = true;
    jest.resetModules();
    throwError = jest.fn();
    throwErrorDeferred = jest.fn();
    jest.mock('throwError', () => ({
      throwErrorDeferred,
      default: throwError,
    }));
    vest = require('vest');
    skipWhen = vest.skipWhen;
    isolate = require('isolate').isolate;
    dummyTest = require('../../testUtils/testDummy').dummyTest;
  });

  afterEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  describe('Base behavior', () => {
    it('Should retain test results between runs', () => {
      const f1 = jest.fn(() => false);
      const f2 = jest.fn(() => false);
      const suite = genSuite(() => {
        skipWhen(!firstRun, () => {
          isolate({ type: IsolateTypes.DEFAULT }, () => {
            vest.test('f1', f1);
            vest.test('f2', f2);
          });
        });
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(f1).toHaveBeenCalledTimes(1);
      expect(f2).toHaveBeenCalledTimes(1);
      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(f1).toHaveBeenCalledTimes(1);
      expect(f2).toHaveBeenCalledTimes(1);
    });
  });

  describe('When order changes within the isolate', () => {
    it('Should contain test order changes within the isolate', () => {
      const suite = genSuite(() => {
        dummyTest.failing('f1');

        isolate({ type: IsolateTypes.EACH }, () => {
          dummyTest.failing('f2');
          if (!firstRun) {
            dummyTest.failing('f3');
            dummyTest.failing('f4');
          }
        });

        vest.skipWhen(!firstRun, () => {
          dummyTest.failing('f5');
        });
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().hasErrors('f3')).toBe(false);
      expect(suite.get().hasErrors('f4')).toBe(false);
      expect(suite.get().hasErrors('f5')).toBe(true);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
      expect(suite.get().tests.f3).not.toBeDefined();
      expect(suite.get().tests.f4).not.toBeDefined();
      expect(suite.get().tests.f5).toBeDefined();

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().hasErrors('f3')).toBe(true);
      expect(suite.get().hasErrors('f4')).toBe(true);

      // without "isolate" this assertion would fail
      // because the test would have been overwritten
      expect(suite.get().hasErrors('f5')).toBe(true);

      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
      expect(suite.get().tests.f3).toBeDefined();
      expect(suite.get().tests.f4).toBeDefined();
      expect(suite.get().tests.f5).toBeDefined();
    });

    it('Should only retain the state of the unmoved state before the order index', () => {
      const suite = genSuite(() => {
        isolate({ type: IsolateTypes.EACH }, () => {
          skipWhen(!firstRun, () => {
            dummyTest.failing('f1');
          });
          if (!firstRun) {
            dummyTest.failing('f2');
          }
          skipWhen(!firstRun, () => {
            dummyTest.failing('f3');
          });
        });

        suite();
        expect(suite.get().hasErrors('f1')).toBe(true);
        expect(suite.get().hasErrors('f2')).toBe(false);
        expect(suite.get().hasErrors('f3')).toBe(true);
        expect(suite.get().tests.f1).toBeDefined();
        expect(suite.get().tests.f2).not.toBeDefined();
        expect(suite.get().tests.f3).toBeDefined();

        suite();
        expect(suite.get().hasErrors('f1')).toBe(true);
        expect(suite.get().hasErrors('f2')).toBe(true);
        expect(suite.get().hasErrors('f3')).toBe(false);
        expect(suite.get().tests.f1).toBeDefined();
        expect(suite.get().tests.f2).toBeDefined();
        expect(suite.get().tests.f3).toBeDefined();
      });
    });
  });

  describe('When test order changes before the isolate opens', () => {
    it('Should clean up follow up tests. Reregister', () => {
      const suite = genSuite(() => {
        dummyTest.failing('f1');
        if (!firstRun) {
          dummyTest.failing('f6');
        }

        // this way we can tell if the state is kept or discarded.
        // if the state is kept, they should be invalid. Otherwise
        // they should be untested.
        skipWhen(!firstRun, () => {
          isolate({ type: IsolateTypes.EACH }, () => {
            dummyTest.failing('f2');
            dummyTest.failing('f3');
            dummyTest.failing('f4');
          });

          dummyTest.failing('f5');
        });
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().hasErrors('f3')).toBe(true);
      expect(suite.get().hasErrors('f4')).toBe(true);
      expect(suite.get().hasErrors('f5')).toBe(true);
      expect(suite.get().hasErrors('f6')).toBe(false);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
      expect(suite.get().tests.f3).toBeDefined();
      expect(suite.get().tests.f4).toBeDefined();
      expect(suite.get().tests.f5).toBeDefined();
      expect(suite.get().tests.f6).not.toBeDefined();

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(false);
      expect(suite.get().hasErrors('f3')).toBe(false);
      expect(suite.get().hasErrors('f4')).toBe(false);
      expect(suite.get().hasErrors('f5')).toBe(false);
      expect(suite.get().hasErrors('f6')).toBe(true);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
      expect(suite.get().tests.f3).toBeDefined();
      expect(suite.get().tests.f4).toBeDefined();
      expect(suite.get().tests.f5).toBeDefined();
      expect(suite.get().tests.f6).toBeDefined();
    });
  });

  describe('When an incorrect isolate is encountered', () => {
    it('Should replace isolate completely', () => {
      const suite = genSuite(() => {
        if (firstRun) {
          isolate({ type: IsolateTypes.EACH }, () => {
            dummyTest.failing('f1');
          });
        } else {
          isolate({ type: IsolateTypes.EACH }, () => {
            dummyTest.failing('f2');
          });
        }
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(false);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).not.toBeDefined();
      suite();
      expect(suite.get().hasErrors('f1')).toBe(false);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().tests.f1).not.toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
    });
  });

  describe('When an isolate is present when a test was expected', () => {
    it('Should erase test history, and re-register', () => {
      const suite = genSuite(() => {
        if (firstRun) {
          dummyTest.failing('f1');
        } else {
          isolate({ type: IsolateTypes.EACH }, () => {
            dummyTest.failing('f2');
          });
        }
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(false);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).not.toBeDefined();
      suite();
      expect(suite.get().hasErrors('f1')).toBe(false);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().tests.f1).not.toBeDefined();
      expect(suite.get().tests.f2).toBeDefined();
    });

    describe('Errors', () => {
      it('should throw a deferred error when the tests are out of order', () => {
        const suite = genSuite(() => {
          isolate({ type: IsolateTypes.GROUP }, () => {
            dummyTest.failing(firstRun ? 'f1' : 'f2');
          });
        });

        suite();
        expect(throwErrorDeferred).toHaveBeenCalledTimes(0);
        suite();
        expect(throwErrorDeferred).toHaveBeenCalledTimes(1);
        expect(throwErrorDeferred).toHaveBeenCalledWith(
          expect.stringContaining(
            'Vest Critical Error: Tests called in different order than previous run'
          )
        );
      });

      it('Should allow unordered tests within an each isolate', () => {
        const suite = genSuite(() => {
          isolate({ type: IsolateTypes.EACH }, () => {
            dummyTest.failing(firstRun ? 'f1' : 'f2');
          });
        });

        suite();
        expect(throwErrorDeferred).toHaveBeenCalledTimes(0);
        suite();
        expect(throwErrorDeferred).toHaveBeenCalledTimes(0);
      });
    });
  });

  function genSuite(cb) {
    return vest.create(() => {
      cb();
      firstRun = false;
    });
  }
});
