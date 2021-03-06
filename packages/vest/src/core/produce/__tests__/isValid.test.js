import wait from 'wait';

import vest, { test, optional } from 'vest';

describe('isValid', () => {
  describe('Before any test ran', () => {
    it('Should return false', () => {
      const suite = vest.create(() => {
        test('field_1', () => false);
      });

      expect(suite.get().isValid()).toBe(false);
    });
  });

  describe('When there are errors in the suite', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(skip => {
        vest.skip(skip);
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
  });

  describe('When there are warnings in the suite', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(() => {
        test('field_1', () => {
          vest.warn();
          return false;
        });
      });
    });
    it('Should return true when a required test has warnings', () => {
      expect(suite().isValid()).toBe(true);
    });
  });

  describe('When a non optional field is skipped', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(skip => {
        vest.skip(skip);
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
    let suite;

    beforeEach(() => {
      suite = vest.create(() => {
        optional('field_1');
        test('field_1', async () => {
          await wait(300);
          return true;
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return false', () => {
        suite();
        expect(suite.get().isValid()).toBe(false);
      });
    });
    describe('When test is passing', () => {
      it('Should return true', async () => {
        suite();
        await wait(300);
        expect(suite.get().isValid()).toBe(true);
      });
    });
  });

  describe('When the suite has warning async tests', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(() => {
        test('field_1', async () => {
          vest.warn();
          await wait(300);
          return true;
        });

        test('field_1', () => {
          return true;
        });
      });
    });

    it('Should return true', () => {
      expect(suite().isValid()).toBe(true);
    });
  });

  describe('When the suite has async non-optional tests', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(only => {
        vest.only(only);
        optional('field_2');
        test('field_1', async () => {
          await wait(300);
          return true;
        });
        test('field_2', () => {
          return true;
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return `false`', () => {
        const result = suite();

        expect(result.isValid()).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('Should return `true`', () => {
        return new Promise(done => {
          const result = suite().done(() => {
            expect(result.isValid()).toBe(true);
            done();
          });
        });
      });
    });

    describe('When test is lagging', () => {
      it('Should return `false`', () => {
        suite();
        const result = suite('field_2');

        expect(result.isValid()).toBe(false);
      });
    });
  });

  describe('When a all required fields are passing', () => {
    let suite;

    beforeEach(() => {
      suite = vest.create(() => {
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
      expect(suite('field_1').isValid()).toBe(true);
    });
  });
});
