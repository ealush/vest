import { TTestSuite } from 'testUtils/TVestMock';
import wait from 'wait';

import { TestPromise } from '../../../testUtils/testPromise';

import { test, optional, create, skipWhen, warn, skip, only } from 'vest';

describe('isValid', () => {
  describe('Before any test ran', () => {
    it('Should return false', () => {
      const suite = create(() => {
        test('field_1', () => false);
      });

      expect(suite.get().isValid()).toBe(false);
    });
  });

  describe('When there are errors in the suite', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((fieldToSkip: string) => {
        skip(fieldToSkip);
        optional('field_1');

        test('field_1', () => false);
        test('field_2', () => false);
        test('sanity', () => true);
      });
    });

    it('Should return false when an optional test has errors', () => {
      expect(suite('field_2').isValid()).toBe(false);
    });
    it('Should return false when a required test has errors', () => {
      expect(suite('field_1').isValid()).toBe(false);
    });

    it('Should return false when the queried field is not optional and has errors', () => {
      expect(suite('field_2').isValid('field_2')).toBe(false);
    });

    it('Should return true when the queried field is optional and has errors', () => {
      expect(suite('field_1').isValid('field_1')).toBe(true);
    });
  });

  describe('When there are warnings in the suite', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        test('field_1', () => {
          warn();
          return false;
        });
      });
    });
    it('Should return true when a required test has warnings', () => {
      expect(suite().isValid()).toBe(true);
      expect(suite().isValid('field_1')).toBe(true);
    });

    describe('When some of the tests for the required field are warnings', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => {
            warn();
            return false;
          });
          test('field_1', () => true);
        });
      });
      it('Should return true when a required test has warnings', () => {
        expect(suite().isValid()).toBe(true);
      });
    });

    describe('when a warning test in a required field is skipped', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => true);

          skipWhen(true, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        });
      });
      it('Should return false even when the skipped field is warning', () => {
        expect(suite().isValid()).toBe(false);
      });
    });
  });

  describe('When a non optional field is skipped', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(fieldToSkip => {
        skip(fieldToSkip);
        test('field_1', () => {
          return false;
        });
        test('field_2', () => {
          return true;
        });
        test('field_3', () => {
          return true;
        });
      });
    });
    it('Should return false', () => {
      expect(suite('field_1').isValid()).toBe(false);
    });
    it('Should return false', () => {
      expect(suite(['field_2', 'field_3']).isValid()).toBe(false);
    });
  });

  describe('When the suite has an async optional test', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        optional('field_1');
        test('field_1', async () => {
          await wait(300);
        });
      });
    });

    describe('When a test is pending', () => {
      it('Should return false', () => {
        suite();
        expect(suite.get().isValid()).toBe(false);
        expect(suite.get().isValid('field_1')).toBe(false);
      });
    });
    describe('When the test is passing', () => {
      it('Should return true', async () => {
        suite();
        await wait(300);
        expect(suite.get().isValid()).toBe(true);
        expect(suite.get().isValid('field_1')).toBe(true);
      });
    });
  });

  describe('When the suite has warning async tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        test('field_1', async () => {
          warn();
          await wait(300);
        });

        test('field_1', () => {
          return true;
        });
      });
    });

    it('Should return false as long as the test is pending', async () => {
      suite();
      expect(suite.get().isValid()).toBe(false);
      await wait(300);
      expect(suite.get().isValid()).toBe(true);
    });

    it('Should return false as long as the test is pending when querying a specific field', async () => {
      suite();
      expect(suite.get().isValid('field_1')).toBe(false);
      await wait(300);
      expect(suite.get().isValid('field_1')).toBe(true);
    });
  });

  describe('When the suite has async non-optional tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(currentField => {
        only(currentField);
        optional('field_2');
        test('field_1', async () => {
          await wait(300);
        });
        test('field_2', () => {
          return true;
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return `false` for a required field', () => {
        const result = suite();

        expect(result.isValid()).toBe(false);
        expect(result.isValid('field_1')).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('Should return `true`', () => {
        return TestPromise(done => {
          suite().done(result => {
            expect(result.isValid()).toBe(true);
            expect(result.isValid('field_1')).toBe(true);
            expect(result.isValid('field_2')).toBe(true);
            done();
          });
        });
      });
    });

    describe('When test is lagging', () => {
      it('Should return `false`', () => {
        return TestPromise(done => {
          suite();
          const result = suite('field_2').done(done);

          expect(result.isValid()).toBe(false);
        });
      });
    });
  });

  describe('When a all required fields are passing', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        test('field_1', () => {
          return true;
        });
        test('field_1', () => {
          return true;
        });
        test('field_2', () => {
          return true;
        });
        test('field_3', () => {
          return true;
        });
      });
    });
    it('Should return true', () => {
      expect(suite().isValid()).toBe(true);
      expect(suite().isValid('field_1')).toBe(true);
      expect(suite().isValid('field_2')).toBe(true);
      expect(suite().isValid('field_3')).toBe(true);
    });
  });

  describe('When a required field has some passing tests', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          test('field_1', () => true);
          skipWhen(true, () => {
            test('field_1', () => {
              return true;
            });
          });
        })().isValid()
      ).toBe(false);
    });
  });

  describe('When field name is specified', () => {
    it('Should return false when field did not run yet', () => {
      expect(
        create(() => {
          skip('field_1');
          test('field_1', () => true);
        })().isValid('field_1')
      ).toBe(false);
    });

    it('Should return false when testing for a field that does not exist', () => {
      expect(
        create(() => {
          test('field_1', () => {});
        })().isValid('field 2')
      ).toBe(false);
    });

    it("Should return false when some of the field's tests ran", () => {
      expect(
        create(() => {
          test('field_1', () => {
            return true;
          });
          skipWhen(true, () => {
            test('field_1', () => {
              return true;
            });
          });
        })().isValid('field_1')
      ).toBe(false);
    });

    it('Should return false when the field has errors', () => {
      expect(
        create(() => {
          test('field_1', () => {
            return false;
          });
        })().isValid('field_1')
      ).toBe(false);
    });

    it('Should return true when all the tests are passing', () => {
      expect(
        create(() => {
          test('field_1', () => {
            return true;
          });
        })().isValid('field_1')
      ).toBe(true);
    });

    it('Should return true when the field only has warnings', () => {
      expect(
        create(() => {
          test('field_1', () => {
            warn();
            return false;
          });
        })().isValid('field_1')
      ).toBe(true);
    });

    it('Should return true if field is optional and did not run', () => {
      expect(
        create(() => {
          optional('field_1');
          skipWhen(true, () => {
            test('field_1', () => false);
          });
        })().isValid('field_1')
      ).toBe(true);
    });
  });

  describe('When querying a non existing field', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          test('field_1', () => true);
        })().isValid('field_2')
      ).toBe(false);
    });
  });
});
