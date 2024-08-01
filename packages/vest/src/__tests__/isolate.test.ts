import { CB, deferThrow } from 'vest-utils';
import { Isolate } from 'vestjs-runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { dummyTest } from 'testDummy';
import * as vest from 'vest';

vi.mock('vest-utils', async () => {
  const vu = await vi.importActual('vest-utils');
  return {
    ...vu,
    deferThrow: vi.fn(),
  };
});

describe('isolate', () => {
  let firstRun = true;

  beforeEach(() => {
    firstRun = true;
  });

  describe('Base behavior', () => {
    it("Should throw an error if the callback isn't a function", () => {
      // @ts-ignore - testing bad input
      expect(() => Isolate.create('xx', {}, 'not a function')).toThrow();
    });

    it('Should retain test results between runs', () => {
      const f1 = vi.fn(() => false);
      const f2 = vi.fn(() => false);
      const suite = genSuite(() => {
        vest.skipWhen(!firstRun, () => {
          vest.test('f1', f1);
          vest.test('f2', f2);
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

        vest.group(() => {
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
      expect(suite.get().tests.f3).toBeUndefined();
      expect(suite.get().tests.f4).toBeUndefined();
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
        vest.group(() => {
          vest.skipWhen(!firstRun, () => {
            dummyTest.failing('f1');
          });
          if (!firstRun) {
            dummyTest.failing('f2');
          }
          vest.skipWhen(!firstRun, () => {
            dummyTest.failing('f3');
          });
        });

        suite();
        expect(suite.get().hasErrors('f1')).toBe(true);
        expect(suite.get().hasErrors('f2')).toBe(false);
        expect(suite.get().hasErrors('f3')).toBe(true);
        expect(suite.get().tests.f1).toBeDefined();
        expect(suite.get().tests.f2).toBeUndefined();
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
        vest.skipWhen(!firstRun, () => {
          vest.group(() => {
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
      expect(suite.get().tests.f6).toBeUndefined();

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
          vest.group(() => {
            dummyTest.failing('f1');
          });
        } else {
          vest.group(() => {
            dummyTest.failing('f2');
          });
        }
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(false);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeUndefined();
      suite();
      expect(suite.get().hasErrors('f1')).toBe(false);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().tests.f1).toBeUndefined();
      expect(suite.get().tests.f2).toBeDefined();
    });
  });

  describe('When an isolate is present when a test was expected', () => {
    it('Should erase test history, and re-register', () => {
      const suite = genSuite(() => {
        if (firstRun) {
          dummyTest.failing('f1');
        } else {
          vest.group(() => {
            dummyTest.failing('f2');
          });
        }
      });

      suite();
      expect(suite.get().hasErrors('f1')).toBe(true);
      expect(suite.get().hasErrors('f2')).toBe(false);
      expect(suite.get().tests.f1).toBeDefined();
      expect(suite.get().tests.f2).toBeUndefined();
      suite();
      expect(suite.get().hasErrors('f1')).toBe(false);
      expect(suite.get().hasErrors('f2')).toBe(true);
      expect(suite.get().tests.f1).toBeUndefined();
      expect(suite.get().tests.f2).toBeDefined();
    });

    describe('Errors', () => {
      it('should throw a deferred error when the tests are out of order', () => {
        const suite = genSuite(() => {
          vest.group(() => {
            dummyTest.failing(firstRun ? 'f1' : 'f2');
          });
        });

        suite();
        suite();
        expect(deferThrow).toHaveBeenCalledWith(
          expect.stringContaining(
            'Vest Critical Error: Tests called in different order than previous run',
          ),
        );
      });
    });
  });

  function genSuite(cb: CB) {
    return vest.create(() => {
      cb();
      firstRun = false;
    });
  }
});
