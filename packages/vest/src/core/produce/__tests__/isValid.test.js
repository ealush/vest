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
