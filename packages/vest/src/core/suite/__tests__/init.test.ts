import { ser } from '../../../../testUtils/suiteDummy';
import { dummyTest } from '../../../../testUtils/testDummy';

import * as vest from 'vest';

describe('suite.init', () => {
  let suite, prevResult;
  beforeEach(() => {
    suite = vest.create(() => {});
    prevResult = genPrevSuite();
  });

  describe('when initializing with prev suite data', () => {
    describe('Initializer object', () => {
      it('Sets the suite result to be the previous object', () => {
        suite.init(prevResult);
        expect(ser(suite.get())).toEqual(ser(prevResult));
      });
    });
    describe('Initializer function', () => {
      it('Sets the suite result to be the previous object', () => {
        suite.init(() => prevResult);
        expect(ser(suite.get())).toEqual(ser(prevResult));
      });
    });
  });

  describe('When running init over a suite that already executed', () => {
    let res;
    beforeEach(() => {
      suite = vest.create(() => {
        dummyTest.failing();
      });
      suite();
      res = suite.get();
    });

    it('Keeps the suite summary object as is', () => {
      suite.init(prevResult);
      expect(ser(suite.get())).toEqual(ser(res));
      expect(ser(suite.get())).not.toEqual(ser(prevResult));
    });
  });

  describe('When running init over a suite that already initiated', () => {
    beforeEach(() => {
      suite = vest.create(() => {});
    });

    it('Keeps the suite summary object as is', () => {
      const firstInit = vest.create(() => {
        dummyTest.failing();
      })();
      suite.init(firstInit);
      suite.init(prevResult);
      expect(ser(suite.get())).toEqual(ser(firstInit));
      expect(ser(suite.get())).not.toEqual(ser(prevResult));
      expect(ser(prevResult)).not.toEqual(ser(firstInit)); // sanity
    });
  });

  describe('Running over initialized suite', () => {
    suite = vest.create(() => {
      dummyTest.failing('f1', 'msg');
    });
    suite.init(prevResult);

    suite();

    expect(ser(suite.get())).toMatchInlineSnapshot(`
      Object {
        "errorCount": 1,
        "groups": Object {},
        "testCount": 1,
        "tests": Object {
          "f1": Object {
            "errorCount": 1,
            "errors": Array [
              "msg",
            ],
            "testCount": 1,
            "valid": false,
            "warnCount": 0,
          },
        },
        "valid": false,
        "warnCount": 0,
      }
    `);
  });

  describe('selectors', () => {
    test('hydrated selectors work properly', () => {
      suite.init(ser(prevResult));
      const res = suite.get();

      expect(res.isValid()).toBe(false);
      expect(res.isValid('username')).toBe(false);
      expect(res.isValid('password')).toBe(true);
      expect(res.isValid('commercial')).toBe(true);
      expect(res.isValid('tos')).toBe(true);
      expect(res.hasErrors()).toBe(true);
      expect(res.hasErrors('username')).toBe(true);
      expect(res.getErrors('username')).toEqual(['already taken']);
      expect(res.hasErrors('password')).toBe(false);
      expect(res.hasWarnings('password')).toBe(true);
      expect(res.getWarnings('password')).toEqual(['password is weak']);
      expect(res.getWarningsByGroup('terms', 'tos')).toEqual([]);
      expect(res.getWarningsByGroup('terms')).toEqual({
        tos: [],
        commercial: ['I agree to be sent spam'],
      });
    });
  });
});

function genPrevSuite() {
  const prevSuite = vest.create(() => {
    dummyTest.passing('username', 'username is required');
    dummyTest.passing('username', 'must be at least 3 chars');
    dummyTest.failing('username', 'already taken');
    dummyTest.passing('password', 'password is required');
    dummyTest.passing('password', 'password is too short');
    dummyTest.failingWarning('password', 'password is weak');
    vest.group('terms', () => {
      dummyTest.passing('tos', 'must be selected');
      dummyTest.failingWarning('commercial', 'I agree to be sent spam');
    });
  });
  return prevSuite();
}
